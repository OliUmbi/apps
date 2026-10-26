import {
	type Page,
	type PageInput,
	recordNotCreatedError,
} from "@oliumbi/contracts";
import { and, desc, eq, ilike, type SQL } from "drizzle-orm";
import type { AnyPgTable, PgColumn, PgSelect } from "drizzle-orm/pg-core";
import { RecordKeyMismatchError, updateMissError } from "./content-errors";
import type { DatabaseExecutor } from "./database.types";
import { paginate, searchPattern } from "./pagination";

/*
 * One parameterized CRUD factory for the managed-content repositories. The
 * spec is pure column descriptors - this package never names a site table; the
 * owning data package instantiates the factory with its own drizzle table.
 *
 * Shared naming convention: a record's field names are the table's drizzle
 * column property names, so the values objects written below double as drizzle
 * `values`/`set` payloads and the caller names the row type (as paginate<Row>
 * does) instead of deriving it from the query builder.
 */

/** Key columns by key-object field: one for a simple key, more for a composite. */
export type ContentKeyColumns<Key> = {
	[Field in keyof Key & string]: PgColumn;
};

export interface ContentRepositorySpec<Key, Input> {
	/** The drizzle table every statement targets. */
	table: AnyPgTable;
	/** The table label a typed error carries, e.g. "site.table". */
	name: string;
	key: ContentKeyColumns<Key>;
	/** The column `list`/`listScoped` search with a case-insensitive pattern. */
	search: PgColumn;
	/** Row timestamps: rows order by createdAt, updates compare-and-set updatedAt. */
	createdAt: PgColumn;
	updatedAt: PgColumn;
	/**
	 * Column projection for reads when the table stores columns (tokens) that
	 * must never cross the package boundary; reads select all columns without it.
	 */
	selection?: Record<string, PgColumn>;
	/** The parent column `listScoped` filters by; child repositories only. */
	scope?: PgColumn;
	/**
	 * A parent reference carried in the values (single-key child rows): never
	 * written on update, claimed in the update WHERE, and a missed statement
	 * separates "row missing" from "values claim another parent".
	 */
	parent?: { column: PgColumn; field: keyof Input & string };
	/**
	 * A composite key is the row's identity: `update` rejects values whose key
	 * fields differ from the addressed key instead of silently re-parenting or
	 * renaming the row.
	 */
	keyIsIdentity?: boolean;
	/**
	 * A state column re-asserted on create and update and required on update, so
	 * rows outside it are never editable (campaigns stay draft while edited).
	 */
	guard?: { column: PgColumn; field: string; value: unknown };
}

export interface ContentRepositoryMethods<Row, Key, Input> {
	list(input: PageInput): Promise<Page<Row>>;
	listScoped(input: PageInput, parent: string): Promise<Page<Row>>;
	get(key: Key): Promise<Row | null>;
	create(input: Input): Promise<Row>;
	update(key: Key, input: Input, expectedUpdatedAt: string): Promise<Row>;
	delete(key: Key): Promise<void>;
}

type Fields = Record<string, unknown>;

export function createContentRepository<Row, Key, Input>(
	db: DatabaseExecutor,
	spec: ContentRepositorySpec<Key, Input>,
): ContentRepositoryMethods<Row, Key, Input> {
	const keyFields = Object.keys(spec.key) as (keyof Key & string)[];

	// Update values carry the record's identity fields; they are never written
	// (a key column stays as the key, a parent reference stays where it is).
	const identityFields = new Set<string>(keyFields);
	if (spec.parent) identityFields.add(spec.parent.field);

	const keyConditions = (key: Key): SQL[] =>
		keyFields.map((field) =>
			eq(spec.key[field], (key as Fields)[field] as never),
		);

	// Rows order by creation, ties by key columns (also the scoped lists' order).
	const orderBy = (query: PgSelect) =>
		query.orderBy(desc(spec.createdAt), ...keyFields.map((f) => spec.key[f]));

	const reads = () =>
		(spec.selection ? db.select(spec.selection) : db.select()).from(
			spec.table,
		) as unknown as PgSelect;

	function list(input: PageInput, scope?: SQL): Promise<Page<Row>> {
		return paginate<Row>(
			orderBy(
				reads()
					.where(
						and(
							scope,
							input.search
								? ilike(spec.search, searchPattern(input.search))
								: undefined,
						),
					)
					.$dynamic(),
			),
			input,
		);
	}

	async function get(key: Key): Promise<Row | null> {
		const [record] = await reads()
			.where(and(...keyConditions(key)))
			.limit(1);
		return (record ?? null) as Row | null;
	}

	async function create(input: Input): Promise<Row> {
		const now = new Date().toISOString();
		const [record] = await db
			.insert(spec.table)
			.values({
				...input,
				...(spec.guard ? { [spec.guard.field]: spec.guard.value } : {}),
				createdAt: now,
				updatedAt: now,
			} as never)
			.returning();
		if (!record) throw recordNotCreatedError();
		return record as Row;
	}

	async function update(
		key: Key,
		input: Input,
		expectedUpdatedAt: string,
	): Promise<Row> {
		// The composite key is the row's identity: it is never written on update,
		// and values that claim another identity are rejected instead of silently
		// re-parenting or renaming the row.
		if (spec.keyIsIdentity)
			for (const field of keyFields)
				if ((input as Fields)[field] !== (key as Fields)[field])
					throw new RecordKeyMismatchError(spec.name);
		const set: Fields = { ...(input as Fields) };
		for (const field of identityFields) delete set[field];
		if (spec.guard) set[spec.guard.field] = spec.guard.value;
		set.updatedAt = new Date().toISOString();
		// The parent reference is an identity column: the statement claims the
		// parent the values name, so a mismatched parent cannot move the row and a
		// missed statement separates a missing row from another parent's row.
		const conditions = keyConditions(key);
		if (spec.parent)
			conditions.push(
				eq(spec.parent.column, (input as Fields)[spec.parent.field] as never),
			);
		if (spec.guard)
			conditions.push(eq(spec.guard.column, spec.guard.value as never));
		conditions.push(eq(spec.updatedAt, expectedUpdatedAt as never));
		const [record] = await db
			.update(spec.table)
			.set(set as never)
			.where(and(...conditions))
			.returning();
		if (record) return record as Row;
		const current = (await get(key)) as ({ updatedAt: string } & Fields) | null;
		throw updateMissError(
			spec.name,
			current,
			expectedUpdatedAt,
			spec.parent
				? current?.[spec.parent.field] === (input as Fields)[spec.parent.field]
				: true,
		);
	}

	async function remove(key: Key): Promise<void> {
		await db.delete(spec.table).where(and(...keyConditions(key)));
	}

	// Repositories expose only the methods they need (guardRepository wraps the
	// ones they name), so `listScoped` reads spec.scope at call time.
	return {
		list: (input) => list(input),
		listScoped: (input, parent) =>
			list(input, eq(spec.scope as PgColumn, parent as never)),
		get,
		create,
		update,
		delete: remove,
	};
}
