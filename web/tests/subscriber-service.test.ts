import assert from "node:assert/strict";
import test from "node:test";
import type { DatabasePool, Transaction } from "../packages/database/src";
import { createSubscriberService } from "../packages/zelglihof-data/src/subscriber.service";

/*
 * Subscriber maintenance beyond the decideCorrection table: which flow writes
 * what per state, that a refused correction touches nothing, and that a lost
 * insert race surfaces as the typed conflict outcome - never a raw driver
 * error at the call boundary. The live-DB invariants of these paths are proven
 * in db-invariants.test.ts; these cover the flow branches without a database.
 */

const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};
const id = "11111111-1111-4111-8111-111111111111";
const takenBy = "22222222-2222-4222-8222-222222222222";

const self = {
	id,
	email: "ana@example.com",
	status: "active",
	unsubscribeToken: "stored-unsub",
};
const unsubscribed = { ...self, status: "unsubscribed" };

/*
 * The fake stands in at the drizzle seam like honeypot.test.ts: one
 * transaction, every operation recorded, selects answered in turn - so
 * "nothing was written and nothing was queued" is observable per branch.
 */
function fakeDatabase(
	selectAnswers: unknown[][] = [],
	hooks: { failUpdates?: () => Error } = {},
) {
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
			return chain(() => {
				if (hooks.failUpdates) throw hooks.failUpdates();
			});
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

function nothingQueued(log: { inserts: unknown[][] }) {
	assert.deepEqual(
		log.inserts.filter((values) => isEmail(values[0])),
		[],
	);
}

test("unsubscribing a missing subscriber is a typed not-found verdict", async () => {
	const run = fakeDatabase([[]]);
	await assert.rejects(
		createSubscriberService(run.database, options).unsubscribe(id),
		(error: unknown) => (error as { code?: string }).code === "not-found",
	);
	assert.equal(run.log.updates, 0);
	nothingQueued(run.log);
});

test("unsubscribing a known subscriber writes the unsubscribe once", async () => {
	const run = fakeDatabase([[self]]);
	assert.equal(
		await createSubscriberService(run.database, options).unsubscribe(id),
		undefined,
	);
	assert.equal(run.log.updates, 1);
	nothingQueued(run.log);
});

test("a correction onto an address owned by another subscriber is refused with nothing written", async () => {
	const run = fakeDatabase([[self], [{ ...self, id: takenBy }]]);
	assert.deepEqual(
		await createSubscriberService(run.database, options).correctEmail(
			id,
			"taken@example.com",
		),
		{ outcome: "conflict" },
	);
	assert.equal(run.log.updates, 0);
	assert.deepEqual(run.log.inserts, []);
});

test("correcting an unsubscribed subscriber keeps them out of the funnel", async () => {
	const run = fakeDatabase([[unsubscribed], []]);
	assert.deepEqual(
		await createSubscriberService(run.database, options).correctEmail(
			id,
			"new@example.com",
		),
		{ outcome: "corrected" },
	);
	// The address moves but no confirmation goes out: a correction must never
	// silently re-subscribe somebody who left.
	assert.equal(run.log.updates, 1);
	nothingQueued(run.log);
});

test("correcting a subscribed address restarts the confirmation for the new address", async () => {
	const run = fakeDatabase([[self], []]);
	assert.deepEqual(
		await createSubscriberService(run.database, options).correctEmail(
			id,
			"New@Example.COM",
		),
		{ outcome: "corrected" },
	);
	assert.equal(run.log.updates, 1);
	assert.equal(run.log.inserts.length, 1);
	const [message] = run.log.inserts.map((values) => values[0]) as [
		Record<string, unknown>,
	];
	assert.equal(isEmail(message), true);
	assert.equal(message.recipient, "new@example.com");
});

test("a lost write race is the typed conflict outcome, never a driver error", async () => {
	const run = fakeDatabase([[self], []], {
		failUpdates: () =>
			Object.assign(new Error("duplicate key value"), { code: "23505" }),
	});
	assert.deepEqual(
		await createSubscriberService(run.database, options).correctEmail(
			id,
			"raced@example.com",
		),
		{ outcome: "conflict" },
	);
	nothingQueued(run.log);
});
