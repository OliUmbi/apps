import { type PageInput, pageResult } from "@oliumbi/contracts";
import type { Database, Transaction } from "@oliumbi/database";
import type { z } from "zod";

type ColumnValues = Record<string, string | number | boolean | null>;

export function createContentStore<Row, Input, Key>(
	sql: Database | Transaction,
	options: {
		table: string;
		selection: ReturnType<Database>;
		schema: z.ZodType<Row>;
		keyColumns: (key: Key) => ColumnValues;
		orderColumns: readonly string[];
		searchColumn: string;
		writeColumns: (input: Input) => ColumnValues;
		editable?: ColumnValues;
	},
) {
	const table = sql(options.table);
	const selection = options.selection;

	function conditions(values: ColumnValues) {
		let condition = sql`true`;
		for (const [column, value] of Object.entries(values)) {
			condition = sql`${condition} AND ${sql(column)} = ${value}`;
		}
		return condition;
	}

	return {
		async list(input: PageInput, filter: ColumnValues = {}) {
			const search = `%${input.search.replace(/[\\%_]/g, "\\$&")}%`;
			const rows = await sql`
    SELECT ${selection} FROM ${table}
    WHERE ${conditions(filter)} AND ${sql(options.searchColumn)}::text ILIKE ${search}
    ORDER BY created_at DESC, ${sql([...options.orderColumns])}
    LIMIT ${input.size + 1} OFFSET ${input.page * input.size}
   `;
			return pageResult(
				rows.map((row) => options.schema.parse(row)),
				input,
			);
		},
		async get(key: Key): Promise<Row | null> {
			const rows =
				await sql`SELECT ${selection} FROM ${table} WHERE ${conditions(options.keyColumns(key))} LIMIT 1`;
			return rows.length ? options.schema.parse(rows[0]) : null;
		},
		async create(input: Input): Promise<Row> {
			const now = new Date();
			const values = {
				...options.writeColumns(input),
				created_at: now,
				updated_at: now,
			};
			const rows =
				await sql`INSERT INTO ${table} ${sql(values)} RETURNING ${selection}`;
			return options.schema.parse(rows[0]);
		},
		async update(key: Key, input: Input): Promise<Row> {
			const values = { ...options.writeColumns(input), updated_at: new Date() };
			const rows = await sql`
    UPDATE ${table} SET ${sql(values)}
    WHERE ${conditions(options.keyColumns(key))} AND ${conditions(options.editable ?? {})}
    RETURNING ${selection}
   `;
			if (!rows.length)
				throw new Error("Record not found or no longer editable");
			return options.schema.parse(rows[0]);
		},
		async delete(key: Key): Promise<void> {
			await sql`DELETE FROM ${table} WHERE ${conditions(options.keyColumns(key))}`;
		},
	};
}
