import assert from "node:assert/strict";
import test from "node:test";
import type { DatabasePool, Transaction } from "../packages/database/src";
import { confirmSubscription } from "../packages/zelglihof-data/src/newsletter.confirm";
import { requestSubscription } from "../packages/zelglihof-data/src/newsletter.subscribe";
import {
	confirmationLifetimeMs,
	hashToken,
	resendDelayMs,
} from "../packages/zelglihof-data/src/newsletter.tokens";
import { unsubscribeByToken } from "../packages/zelglihof-data/src/newsletter.unsubscribe";

/*
 * The subscription decision table (decideSubscription) and the confirm paths
 * are decided per row; these tests cover the flows around that table: which
 * branch writes and queues what, that every refusal is a typed verdict with
 * zero side effects, and that the delivered confirm link cannot be replayed
 * from the stored secret (the row keeps a hash, never the token).
 */

const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};
const id = "11111111-1111-4111-8111-111111111111";
const email = "ana@example.com";
const now = Date.now();

const activeRow = {
	id,
	email,
	status: "active",
	requestedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
	unsubscribeToken: "stored-unsub",
};
const pendingFresh = {
	id,
	email,
	status: "pending",
	requestedAt: new Date(now - 60_000).toISOString(),
	unsubscribeToken: "stored-unsub",
};
const pendingPastDelay = {
	id,
	email,
	status: "pending",
	requestedAt: new Date(now - resendDelayMs - 60_000).toISOString(),
	unsubscribeToken: "stored-unsub",
};
const pendingExpired = {
	id,
	email,
	status: "pending",
	requestedAt: new Date(now - confirmationLifetimeMs - 60_000).toISOString(),
	unsubscribeToken: "stored-unsub",
};
const unsubscribedRow = {
	id,
	email,
	status: "unsubscribed",
	requestedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
	unsubscribeToken: "stored-unsub",
};

/*
 * The fake stands in at the drizzle seam like honeypot.test.ts: one
 * transaction, every operation recorded, selects answered in turn - so
 * "nothing was written and nothing was queued" is observable per branch.
 */
function fakeDatabase(selectAnswers: unknown[][] = []) {
	const log = {
		transactions: 0,
		operations: [] as string[],
		inserts: [] as unknown[][],
		updates: 0,
	};
	let selectRun = 0;
	const chain = (finish: (values: unknown[]) => unknown) => {
		const values: unknown[] = [];
		const api: Record<string, unknown> = {};
		const step =
			(name: string) =>
			(...input: unknown[]) => {
				if (name === "values") values.push(input[0]);
				return api;
			};
		for (const name of [
			"select",
			"insert",
			"update",
			"execute",
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
				.then(() => finish(values))
				.then(resolve, reject);
		return api;
	};
	const transaction = {
		select: () => {
			log.operations.push("select");
			const answer = selectAnswers[selectRun++] ?? [];
			return chain(() => answer);
		},
		insert: () => {
			log.operations.push("insert");
			return chain((values) => {
				log.inserts.push(values);
				return [{ id: `row-${log.inserts.length}` }];
			});
		},
		update: () => {
			log.operations.push("update");
			log.updates += 1;
			return chain(() => undefined);
		},
		execute: () => {
			log.operations.push("execute");
			return chain(() => undefined);
		},
	} as unknown as Transaction;
	const database = {
		role: "postgres",
		db: transaction,
		transaction: <T>(work: (inner: Transaction) => Promise<T>) => {
			log.transactions += 1;
			return work(transaction);
		},
		close: async () => {},
	} as unknown as DatabasePool;
	return { database, log };
}

function isEmail(payload: unknown) {
	return (payload as { type?: string }).type === "email";
}

function queued(log: { inserts: unknown[][] }) {
	return log.inserts.filter((values) => isEmail(values[0]));
}

function untouched(log: {
	inserts: unknown[][];
	updates: number;
	operations: string[];
}) {
	assert.deepEqual(queued(log), []);
	assert.equal(log.updates, 0);
	assert.deepEqual(
		log.operations.filter((op) => op === "insert" || op === "update"),
		[],
	);
}

test("an active subscriber's signup is suppressed and touches nothing", async () => {
	const run = fakeDatabase([[activeRow]]);
	assert.deepEqual(
		await requestSubscription(run.database, options, "Ana@Example.COM"),
		{ outcome: "suppressed" },
	);
	untouched(run.log);
});

test("a pending address inside the resend delay is not re-mailed", async () => {
	const run = fakeDatabase([[pendingFresh]]);
	assert.deepEqual(await requestSubscription(run.database, options, email), {
		outcome: "suppressed",
	});
	untouched(run.log);
});

test("a resend past the delay stores a fresh request and queues a confirmation", async () => {
	const run = fakeDatabase([[pendingPastDelay]]);
	assert.deepEqual(await requestSubscription(run.database, options, email), {
		outcome: "confirmation-sent",
	});
	assert.equal(run.log.updates, 0);
	assert.equal(run.log.inserts.length, 2);
	const [stored, message] = run.log.inserts.map((values) => values[0]) as [
		Record<string, unknown>,
		Record<string, unknown>,
	];
	assert.equal(stored.email, email);
	assert.equal(stored.status, "pending");
	// The delivered link's raw token is never what the row stores: a leaked row
	// cannot be replayed as a confirm link.
	const text = String(message.text);
	const [, token] = /\/newsletter\/confirm\/([A-Za-z0-9_-]+)/.exec(text) ?? [];
	assert.ok(token, "the confirmation link carries the raw token");
	assert.equal(stored.confirmationTokenHash, hashToken(token));
	assert.notEqual(stored.confirmationTokenHash, token);
	assert.equal(message.recipient, email);
});

test("a re-subscribe keeps the stored unsubscribe token, a new signup gets a fresh one", async () => {
	const again = fakeDatabase([[unsubscribedRow]]);
	assert.deepEqual(await requestSubscription(again.database, options, email), {
		outcome: "confirmation-sent",
	});
	assert.equal(again.log.inserts.length, 2);
	const [stored] = again.log.inserts.map((values) => values[0]) as [
		Record<string, unknown>,
	];
	assert.equal(stored.unsubscribeToken, "stored-unsub");

	const fresh = fakeDatabase([[]]);
	assert.deepEqual(await requestSubscription(fresh.database, options, email), {
		outcome: "confirmation-sent",
	});
	assert.equal(fresh.log.inserts.length, 2);
	const [created] = fresh.log.inserts.map((values) => values[0]) as [
		Record<string, unknown>,
	];
	assert.equal(typeof created.unsubscribeToken, "string");
	assert.ok(String(created.unsubscribeToken).length > 0);
	assert.notEqual(created.unsubscribeToken, "stored-unsub");
});

test("a malformed address is a typed validation verdict before any query", async () => {
	const run = fakeDatabase();
	await assert.rejects(
		requestSubscription(run.database, options, "not-an-email"),
		(error: unknown) => (error as { code?: string }).code === "validation",
	);
	assert.equal(run.log.transactions, 0);
	untouched(run.log);
});

test("confirming an unknown token is typed invalid and writes nothing", async () => {
	const run = fakeDatabase([[]]);
	assert.deepEqual(await confirmSubscription(run.database, options, "nope"), {
		outcome: "invalid",
	});
	untouched(run.log);
});

test("confirming an already-active subscriber is a no-op, not a new welcome", async () => {
	const run = fakeDatabase([[activeRow]]);
	assert.deepEqual(await confirmSubscription(run.database, options, "tok"), {
		outcome: "already-confirmed",
	});
	untouched(run.log);
});

test("confirming an unsubscribed row is invalid, never a silent re-subscribe", async () => {
	const run = fakeDatabase([[unsubscribedRow]]);
	assert.deepEqual(await confirmSubscription(run.database, options, "tok"), {
		outcome: "invalid",
	});
	untouched(run.log);
});

test("a confirmation past its lifetime is expired and queues no welcome", async () => {
	const run = fakeDatabase([[pendingExpired]]);
	assert.deepEqual(await confirmSubscription(run.database, options, "tok"), {
		outcome: "expired",
	});
	untouched(run.log);
});

test("a fresh confirmation activates the row and queues the welcome with the stored unsubscribe link", async () => {
	const run = fakeDatabase([[pendingFresh]]);
	assert.deepEqual(await confirmSubscription(run.database, options, "tok"), {
		outcome: "confirmed",
	});
	assert.equal(run.log.updates, 1);
	assert.equal(run.log.inserts.length, 1);
	const [message] = run.log.inserts.map((values) => values[0]) as [
		Record<string, unknown>,
	];
	assert.equal(isEmail(message), true);
	assert.equal(message.recipient, email);
	// The welcome carries the stored unsubscribe token: links already delivered
	// to this subscriber keep working.
	assert.ok(
		String(message.text).includes(`/newsletter/unsubscribe/stored-unsub`),
	);
});

test("unsubscribing by token covers invalid, repeat and fresh verdicts", async () => {
	const unknown = fakeDatabase([[]]);
	assert.deepEqual(await unsubscribeByToken(unknown.database, "tok"), {
		outcome: "invalid",
	});
	untouched(unknown.log);

	const again = fakeDatabase([[unsubscribedRow]]);
	assert.deepEqual(await unsubscribeByToken(again.database, "tok"), {
		outcome: "already-unsubscribed",
	});
	untouched(again.log);

	const fresh = fakeDatabase([[activeRow]]);
	assert.deepEqual(await unsubscribeByToken(fresh.database, "tok"), {
		outcome: "unsubscribed",
	});
	assert.equal(fresh.log.updates, 1);
	assert.deepEqual(queued(fresh.log), []);
	assert.deepEqual(fresh.log.inserts, []);
});
