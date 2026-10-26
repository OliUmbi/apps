import assert from "node:assert/strict";
import test from "node:test";
import type { DatabasePool, Transaction } from "../packages/database/src";
import { campaignEmail } from "../packages/zelglihof-data/src/campaign.email";
import { createCampaignService } from "../packages/zelglihof-data/src/campaign.service";
import type {
	CampaignDispatch,
	CampaignRecipient,
} from "../packages/zelglihof-data/src/campaign.types";

/*
 * Beyond the saved-draft refusal (campaign-saved-draft.test.ts): one send run
 * walks every active subscriber in batches and queues each of them exactly
 * once - the run's count is the real total, and an empty list is still a
 * completed run that marks the campaign queued. Batching is unbounded by
 * design (R19): no test here looks for a batch limit. The batch cursor itself
 * (`gt(subscriber.id, afterId)`) is a SQL predicate and needs a live DB.
 */

const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};
const savedAt = "2026-02-01T10:00:00.000Z";
const id = "11111111-1111-4111-8111-111111111111";
const campaignRow = {
	id,
	subject: "Frühling",
	body: "Hallo",
	status: "draft",
	createdAt: "2026-01-15T00:00:00.000Z",
	updatedAt: savedAt,
};
const recipientA = {
	id: "a",
	email: "a@example.com",
	unsubscribeToken: "tok-a",
};
const recipientB = {
	id: "b",
	email: "b@example.com",
	unsubscribeToken: "tok-b",
};
const recipientC = {
	id: "c",
	email: "c@example.com",
	unsubscribeToken: "tok-c",
};

/*
 * The fake stands in at the drizzle seam like campaign-saved-draft.test.ts;
 * recipient reads are identified by their FOR SHARE lock and answered one
 * batch per run, so the batch loop itself is observable.
 */
function fakeDatabase(batches: Array<Array<Record<string, unknown>>>) {
	const log = { enqueued: [] as unknown[], updates: 0 };
	let recipientRuns = 0;
	const chain = (answer: (calls: string[], args: unknown[][]) => unknown) => {
		const calls: string[] = [];
		const args: unknown[][] = [];
		const api: Record<string, unknown> = {};
		const step =
			(name: string) =>
			(...input: unknown[]) => {
				calls.push(name);
				args.push(input);
				return api;
			};
		for (const name of [
			"select",
			"insert",
			"update",
			"from",
			"where",
			"orderBy",
			"limit",
			"set",
			"values",
			"for",
			"onConflictDoNothing",
			"onConflictDoUpdate",
			"returning",
		])
			api[name] = step(name);
		// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
		api.then = (
			resolve: (value: unknown) => unknown,
			reject: (error: unknown) => unknown,
		) =>
			Promise.resolve()
				.then(() => answer(calls, args))
				.then(resolve, reject);
		return api;
	};
	const transaction = {
		select: () =>
			chain((calls, args) => {
				const terminal = calls.indexOf("for");
				if (terminal >= 0 && args[terminal][0] === "share") {
					recipientRuns += 1;
					return batches[recipientRuns - 1] ?? [];
				}
				return [campaignRow];
			}),
		update: () =>
			chain(() => {
				log.updates += 1;
			}),
		insert: () =>
			chain((calls, args) => {
				const at = calls.indexOf("values");
				if (at >= 0) log.enqueued.push(args[at][0]);
			}),
	} as unknown as Transaction;
	const database = {
		role: "postgres",
		db: transaction,
		transaction: <T>(work: (inner: Transaction) => Promise<T>) =>
			work(transaction),
		close: async () => {},
	} as unknown as DatabasePool;
	return { database, log };
}

test("one run queues every recipient across batches exactly once", async () => {
	const run = fakeDatabase([[recipientA, recipientB], [recipientC], []]);
	const result = await createCampaignService(run.database, options).send(
		id,
		savedAt,
	);
	assert.deepEqual(result, { outcome: "queued", count: 3, savedAt });
	assert.equal(run.log.enqueued.length, 3);
	assert.deepEqual(
		run.log.enqueued.map(
			(message) => (message as { recipient: string }).recipient,
		),
		["a@example.com", "b@example.com", "c@example.com"],
	);
	// The campaign is marked queued once, after the queueing run.
	assert.equal(run.log.updates, 1);
});

test("a run with no recipients still completes and marks the campaign queued", async () => {
	const run = fakeDatabase([[]]);
	const result = await createCampaignService(run.database, options).send(
		id,
		savedAt,
	);
	assert.deepEqual(result, { outcome: "queued", count: 0, savedAt });
	assert.deepEqual(run.log.enqueued, []);
	assert.equal(run.log.updates, 1);
});

test("each queued mail carries the body and a working unsubscribe link", async () => {
	const run = fakeDatabase([[recipientA]]);
	await createCampaignService(run.database, options).send(id, savedAt);
	const [message] = run.log.enqueued as [Record<string, unknown>];
	assert.equal(message.type, "email");
	assert.equal(message.site, "zelglihof");
	assert.equal(message.sender, options.sender);
	assert.equal(message.replyTo, options.replyTo);
	assert.equal(message.recipient, "a@example.com");
	assert.equal(message.subject, "Frühling");
	assert.equal(
		message.text,
		"Hallo\n\nNewsletter abbestellen: http://localhost:8003/newsletter/unsubscribe/tok-a",
	);
});

test("the campaign mail is built from the dispatch row, the recipient and the options", () => {
	const campaign: CampaignDispatch = {
		id,
		subject: "Frühling",
		body: "Hallo & willkommen",
		status: "draft",
	};
	const recipient: CampaignRecipient = {
		id: "a",
		email: "a@example.com",
		unsubscribeToken: "tok-a",
	};
	const message = campaignEmail(campaign, recipient, options);
	assert.equal(message.recipient, "a@example.com");
	assert.equal(message.subject, "Frühling");
	assert.equal(
		message.text,
		"Hallo & willkommen\n\nNewsletter abbestellen: http://localhost:8003/newsletter/unsubscribe/tok-a",
	);
	assert.ok(
		message.html.includes("Hallo &amp; willkommen"),
		"the body is escaped into the HTML part",
	);
});
