import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor, SqlFragment } from "./database.types";
import { createRowReader, type RowDecoder } from "./row-reader";

type ColumnValues = Record<string, string | number | boolean | null>;

export function createContentRepository<Row, Input, Key>(
	sql: SqlExecutor,
	options: {
		table: string;
		selection: SqlFragment;
		schema: RowDecoder<Row>;
		keyColumns: (key: Key) => ColumnValues;
		orderColumns: readonly string[];
		searchColumn: string;
		writeColumns: (input: Input) => ColumnValues;
		editable?: ColumnValues;
	},
) {
	const table = sql(options.table);
	const read = createRowReader(sql, {
		...options,
		orderBy: sql`created_at DESC, ${sql([...options.orderColumns])}`,
	});
	function conditions(values: ColumnValues) {
		let condition = sql`true`;
		for (const [column, value] of Object.entries(values)) {
			condition =
				value === null
					? sql`${condition} AND ${sql(column)} IS NULL`
					: sql`${condition} AND ${sql(column)} = ${value}`;
		}
		return condition;
	}
	function identity(key: Key) {
		const columns = options.keyColumns(key);
		if (!Object.keys(columns).length)
			throw new Error("A record key is required");
		return conditions(columns);
	}
	return {
		read,
		list(input: PageInput, filter: ColumnValues = {}) {
			const search = input.search
				? sql`${sql(options.searchColumn)}::text ILIKE ${`%${input.search.replace(/[\\%_]/g, "\\$&")}%`}`
				: sql`true`;
			return read.page(input, sql`${conditions(filter)} AND ${search}`);
		},
		get(key: Key) {
			return read.find(identity(key));
		},
		async create(input: Input): Promise<Row> {
			const now = new Date();
			const values = {
				...options.writeColumns(input),
				created_at: now,
				updated_at: now,
			};
			const rows =
				await sql`INSERT INTO ${table} ${sql(values)} RETURNING ${options.selection}`;
			return options.schema.parse(rows[0]);
		},
		async update(key: Key, input: Input): Promise<Row> {
			const values = { ...options.writeColumns(input), updated_at: new Date() };
			const rows = await sql`
    UPDATE ${table} SET ${sql(values)}
    WHERE ${identity(key)} AND ${conditions(options.editable ?? {})}
    RETURNING ${options.selection}
   `;
			if (!rows.length)
				throw new Error("Record not found or no longer editable");
			return options.schema.parse(rows[0]);
		},
		async delete(key: Key): Promise<void> {
			await sql`DELETE FROM ${table} WHERE ${identity(key)}`;
		},
	};
}
