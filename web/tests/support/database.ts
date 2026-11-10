import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import {
	createDatabasePool,
	type Database,
	type DatabasePool,
	type Transaction,
} from "../../packages/database/src";

/*
 * The integration suites run against a real PostgreSQL database because the
 * behaviour they cover lives in SQL: row locks, joins, upserts, aggregates and
 * the schema constraints Flyway owns. Set STUDIO_TEST_ADMIN_URL (and, when the
 * user differs from the default "postgres" role, STUDIO_TEST_ADMIN_ROLE).
 *
 * A missing database must be loud: silently skipping the only tests that cover
 * the write paths is how a green suite lies. CI fails the run; locally the
 * suites skip with one warning per test file.
 */
const url = process.env.STUDIO_TEST_ADMIN_URL;

export const databaseEnabled = Boolean(url);
export const databaseRole = process.env.STUDIO_TEST_ADMIN_ROLE ?? "postgres";

if (!databaseEnabled) {
	const message =
		"PostgreSQL integration suites skipped: set STUDIO_TEST_ADMIN_URL " +
		"(and STUDIO_TEST_ADMIN_ROLE when not using the postgres role). " +
		"See documentation/development/verification.md.";
	if (process.env.CI)
		throw new Error(`A test suite was skipped in CI - ${message}`);
	console.warn(message);
}

export type SiteRole =
	| "studio"
	| "oliumbi"
	| "jublawoma"
	| "unclet"
	| "zelglihof";

export function adminDatabase(): DatabasePool {
	if (!databaseEnabled) throw new Error("STUDIO_TEST_ADMIN_URL is not set");
	return createDatabasePool({
		role: databaseRole,
		applicationName: "integration-tests",
		connectionString: () => process.env.STUDIO_TEST_ADMIN_URL,
		// Test files run in parallel; one connection serves a rolled-back fixture
		// (the joined pool reuses its transaction), so a small pool keeps the
		// whole suite well below PostgreSQL's connection limit.
		maxConnections: 2,
	});
}

/**
 * A pool whose transaction is the harness transaction. Services open their own
 * transaction, so this lets them run inside the caller's rollback fixture while
 * still issuing real SQL.
 */
export function joinedDatabase(transaction: Transaction): DatabasePool {
	return {
		role: databaseRole,
		db: transaction as unknown as Database,
		transaction: (work) => work(transaction),
		close: async () => {},
	};
}

const rollback = new Error("Rollback integration fixtures");

/** Runs `work` in a transaction that is always rolled back, leaving no rows. */
export async function rolledBack(
	database: DatabasePool,
	work: (transaction: Transaction) => Promise<void>,
) {
	try {
		await database.transaction(async (transaction) => {
			await work(transaction);
			throw rollback;
		});
	} catch (error) {
		if (error !== rollback) throw error;
	}
}

/** Runs `work` with the database role a deployed site uses, then restores it. */
export async function asRole(
	transaction: Transaction,
	role: SiteRole,
	work: () => Promise<void>,
) {
	await transaction.execute(sql`SET LOCAL ROLE ${sql.raw(role)}`);
	try {
		await work();
	} finally {
		await transaction.execute(sql`RESET ROLE`);
	}
}

export interface SqlError {
	code?: string;
	constraint?: string;
	message?: string;
}

/** Walks drizzle's error wrapping to the PostgreSQL error underneath. */
export function sqlErrorOf(error: unknown): SqlError {
	let current = error as
		| {
				cause?: unknown;
				code?: unknown;
				constraint?: unknown;
				message?: unknown;
		  }
		| undefined;
	for (let depth = 0; current && depth < 8; depth += 1) {
		if (typeof current.code === "string")
			return {
				code: current.code,
				constraint:
					typeof current.constraint === "string"
						? current.constraint
						: undefined,
				message: typeof current.message === "string" ? current.message : "",
			};
		current = current.cause as typeof current;
	}
	return { message: String(error) };
}

/**
 * Asserts the database refused the statement for the stated reason. Matching the
 * SQLSTATE (and optionally the constraint) keeps a test from passing because an
 * unrelated NOT NULL, cast or permission error happened to reject the same row.
 */
export async function expectRejected(
	work: () => Promise<unknown>,
	expected: { code: string; constraint?: string },
) {
	let thrown: unknown;
	try {
		await work();
	} catch (error) {
		thrown = error;
	}
	assert.ok(
		thrown,
		`expected SQLSTATE ${expected.code}, but the statement ran`,
	);
	const error = sqlErrorOf(thrown);
	assert.equal(
		error.code,
		expected.code,
		`expected SQLSTATE ${expected.code}, got ${error.code ?? "none"}: ${error.message}`,
	);
	if (expected.constraint)
		assert.equal(
			error.constraint,
			expected.constraint,
			`expected constraint ${expected.constraint}, got ${error.constraint ?? "none"}`,
		);
}
