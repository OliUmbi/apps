import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import type { AnyPgTable, PgColumn } from "drizzle-orm/pg-core";
import type { Transaction } from "../../packages/database/src";

/*
 * Assertions shared by the repository suites that run against PostgreSQL. They
 * stay table-agnostic: a site suite passes its own store, input and key
 * projection, so behaviour is pinned once here instead of restated per site.
 */

interface Timestamps {
	createdAt: string;
	updatedAt: string;
}

interface ContentStore<Row, Key, Input> {
	create(input: Input): Promise<Row>;
	get(key: Key): Promise<Row | null>;
	update(key: Key, input: Input, expectedUpdatedAt: string): Promise<Row>;
	delete(key: Key): Promise<void>;
}

/**
 * Creates through the store, reads the row back by its own key and checks the
 * created record echoes the input. The read is the meaningful round trip: the
 * create's RETURNING clause and the read's selection must agree.
 */
export async function expectRoundTrip<Row extends Timestamps, Key, Input>(
	store: Pick<ContentStore<Row, Key, Input>, "create" | "get">,
	input: Input,
	keyOf: (record: Row) => Key,
): Promise<Row> {
	const record = await store.create(input);
	assert.deepEqual(await store.get(keyOf(record)), record);
	for (const [field, value] of Object.entries(input as Record<string, unknown>))
		assert.deepEqual(
			(record as unknown as Record<string, unknown>)[field],
			value,
			`created ${field}`,
		);
	assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
	return record;
}

type IdTable = AnyPgTable & {
	id: PgColumn;
	createdAt: PgColumn;
	updatedAt: PgColumn;
};

/** Moves a row's updatedAt past any real save, standing in for a faster editor. */
export async function advanceUpdatedAt(
	transaction: Transaction,
	table: IdTable,
	id: string,
): Promise<string> {
	const token = new Date(Date.now() + 60_000).toISOString();
	await transaction
		.update(table)
		.set({ updatedAt: token } as never)
		.where(eq(table.id, id));
	return token;
}

/** Pins a row's createdAt so a list's newest-first order has a known answer. */
export async function setCreatedAt(
	transaction: Transaction,
	table: IdTable,
	id: string,
	createdAt: string,
): Promise<void> {
	await transaction
		.update(table)
		.set({ createdAt } as never)
		.where(eq(table.id, id));
}
