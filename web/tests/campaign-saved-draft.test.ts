import assert from "node:assert/strict";
import test from "node:test";
import type { DatabasePool, Transaction } from "../packages/database/src";
import {
	createCampaignService,
	decideCampaignSend,
} from "../packages/zelglihof-data/src/campaign.service";
import type {
	CampaignSendOutcome,
	CampaignSendResult,
} from "../packages/zelglihof-data/src/campaign.types";

/*
 * R04: a send names exactly one saved version of the draft (the editor's
 * updatedAt token). A token that no longer matches the saved row is the typed
 * stale-draft outcome - never an error stack - and queues nothing. The queued
 * result names the exact saved version that was queued.
 */

const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};

const savedAt = "2026-02-01T10:00:00.000Z";
const staleToken = "2026-01-01T00:00:00.000Z";
const id = "11111111-1111-4111-8111-111111111111";
const campaignRow = {
	id,
	subject: "Frühling",
	body: "Hallo",
	status: "draft",
	createdAt: "2026-01-15T00:00:00.000Z",
	updatedAt: savedAt,
};

// Compile-time completeness: every decision outcome has a result form.
const sendOutcomes: Record<CampaignSendOutcome, CampaignSendResult["outcome"]> =
	{
		queued: "queued",
		"stale-draft": "stale-draft",
	};

test("a send refuses any token that is not the saved version", () => {
	assert.deepEqual(Object.keys(sendOutcomes).sort(), ["queued", "stale-draft"]);
	assert.deepEqual(
		decideCampaignSend({
			expectedUpdatedAt: savedAt,
			savedUpdatedAt: savedAt,
		}),
		{ outcome: "queued", queue: true },
	);
	assert.deepEqual(
		decideCampaignSend({
			expectedUpdatedAt: staleToken,
			savedUpdatedAt: savedAt,
		}),
		{ outcome: "stale-draft", queue: false },
	);
});

/*
 * The service drives its repositories as drizzle chains over one transaction;
 * the fake stands in at that seam and records what reaches the queue and the
 * campaign row, so "nothing was queued" is observable.
 */
function fakeDatabase(
	campaign: Record<string, unknown> | null,
	recipients: Array<Record<string, unknown>>,
) {
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
		])
			api[name] = step(name);
		// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
		api.then = (resolve: (value: unknown) => unknown) =>
			Promise.resolve(answer(calls, args)).then(resolve);
		return api;
	};
	const transaction = {
		select: () =>
			chain((calls, args) => {
				const terminal = calls.indexOf("for");
				if (terminal >= 0 && args[terminal][0] === "share") {
					recipientRuns += 1;
					return recipientRuns === 1 ? recipients : [];
				}
				return campaign ? [campaign] : [];
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

test("a stale-draft refusal queues nothing and marks nothing", async () => {
	const { database, log } = fakeDatabase(campaignRow, [
		{ id: "a", email: "a@example.com", unsubscribeToken: "token-a" },
	]);
	const result = await createCampaignService(database, options).send(
		id,
		staleToken,
	);
	// A typed outcome, not a rejection: the caller sees the clear verdict.
	assert.deepEqual(result, { outcome: "stale-draft" });
	assert.deepEqual(log.enqueued, []);
	assert.equal(log.updates, 0);
});

test("the confirmation names the exact saved version that was queued", async () => {
	const { database, log } = fakeDatabase(campaignRow, [
		{ id: "a", email: "a@example.com", unsubscribeToken: "token-a" },
		{ id: "b", email: "b@example.com", unsubscribeToken: "token-b" },
	]);
	const result = await createCampaignService(database, options).send(
		id,
		savedAt,
	);
	assert.deepEqual(result, { outcome: "queued", count: 2, savedAt });
	assert.equal(log.enqueued.length, 2);
	assert.equal(log.updates, 1);
});

test("a missing or no-longer-draft campaign is a typed refusal", async () => {
	const missing = fakeDatabase(null, []);
	await assert.rejects(
		createCampaignService(missing.database, options).send(id, savedAt),
		(error: unknown) => (error as { code?: string }).code === "not-found",
	);
	const sent = fakeDatabase({ ...campaignRow, status: "queued" }, []);
	await assert.rejects(
		createCampaignService(sent.database, options).send(id, savedAt),
		(error: unknown) => (error as { code?: string }).code === "forbidden",
	);
});
