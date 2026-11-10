import assert from "node:assert/strict";
import type { DatabasePool, Transaction } from "../../packages/database/src";

/*
 * One recording drizzle fake for the flow tests that must stay unit-fast: it
 * answers selects by call order and records enough of every statement that a
 * test can assert *what* was issued - the target table, the written values and
 * the terminal lock/skip clauses - not merely that something happened.
 *
 * Tests that need real SQL behaviour (joins, row locks, upserts, aggregates)
 * belong in tests/integration and use support/database.ts instead.
 */

export interface SelectRun {
	calls: string[];
	args: unknown[][];
}

export interface FakeDatabaseLog {
	transactions: number;
	operations: string[];
	selects: SelectRun[];
	inserts: unknown[][];
	insertTables: unknown[];
	updates: number;
	updateValues: unknown[];
	updateTables: unknown[];
	executes: unknown[];
}

export interface FakeDatabaseHooks {
	/** Thrown when an update is awaited (simulates a lost unique race). */
	failUpdates?: () => Error;
	/** Overrides the answer of a select by call index and recorded chain. */
	onSelect?: (run: SelectRun, index: number) => unknown;
}

export function fakeDatabase(
	selectAnswers: unknown[][] = [],
	hooks: FakeDatabaseHooks = {},
) {
	const log: FakeDatabaseLog = {
		transactions: 0,
		operations: [],
		selects: [],
		inserts: [],
		insertTables: [],
		updates: 0,
		updateValues: [],
		updateTables: [],
		executes: [],
	};
	let selectRun = 0;

	const chain = (
		run: SelectRun | null,
		finish: (values: unknown[]) => unknown,
	) => {
		const values: unknown[] = [];
		const api: Record<string, unknown> = {};
		const step =
			(name: string) =>
			(...input: unknown[]) => {
				run?.calls.push(name);
				run?.args.push(input);
				if (name === "values" || name === "set") values.push(input[0]);
				return api;
			};
		for (const name of [
			"select",
			"insert",
			"update",
			"execute",
			"from",
			"innerJoin",
			"where",
			"orderBy",
			"limit",
			"offset",
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
			const run: SelectRun = { calls: [], args: [] };
			log.operations.push("select");
			log.selects.push(run);
			const index = selectRun;
			selectRun += 1;
			const answer = hooks.onSelect
				? hooks.onSelect(run, index)
				: (selectAnswers[index] ?? []);
			return chain(run, () => answer);
		},
		insert: (table: unknown) => {
			log.operations.push("insert");
			log.insertTables.push(table);
			return chain(null, (values) => {
				log.inserts.push(values);
				return [{ id: `row-${log.inserts.length}` }];
			});
		},
		update: (table: unknown) => {
			log.operations.push("update");
			log.updateTables.push(table);
			return chain(null, (values) => {
				log.updates += 1;
				for (const value of values) log.updateValues.push(value);
				if (hooks.failUpdates) throw hooks.failUpdates();
			});
		},
		execute: () => {
			log.operations.push("execute");
			return chain(null, () => undefined);
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

	return { database, transaction, log };
}

/** The email envelopes in the recorded inserts (queue messages carry `type`). */
export function queuedEmails(log: FakeDatabaseLog): unknown[][] {
	return log.inserts.filter(
		(values) => (values[0] as { type?: string } | undefined)?.type === "email",
	);
}

/** Asserts the branch wrote no row and queued no email. */
export function expectNoWrites(log: FakeDatabaseLog) {
	assert.deepEqual(
		log.inserts.map(
			(values) => (values[0] as { type?: string })?.type ?? "row",
		),
		[],
		"expected no insert, some ran",
	);
	assert.equal(log.updates, 0, "expected no update, some ran");
}
