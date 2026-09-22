import { type PageInput, pageResult } from "@oliumbi/contracts";
import type { SqlExecutor, SqlFragment } from "./database.types";

export interface RowDecoder<Row> {
	parse(value: unknown): Row;
}

export interface RowSelection<Row> {
	table: string;
	selection: SqlFragment;
	schema: RowDecoder<Row>;
	orderBy: SqlFragment;
}

export function createRowReader<Row>(
	sql: SqlExecutor,
	options: RowSelection<Row>,
) {
	const table = sql(options.table);
	const decode = (rows: readonly unknown[]) =>
		rows.map((row) => options.schema.parse(row));
	return {
		async page(
			input: PageInput,
			where: SqlFragment,
			orderBy = options.orderBy,
		) {
			const rows = await sql`
    SELECT ${options.selection} FROM ${table}
    WHERE ${where} ORDER BY ${orderBy}
    LIMIT ${input.size + 1} OFFSET ${input.page * input.size}
   `;
			return pageResult(decode(rows), input);
		},
		async find(
			where: SqlFragment,
			orderBy = options.orderBy,
		): Promise<Row | null> {
			const rows = await sql`
    SELECT ${options.selection} FROM ${table}
    WHERE ${where} ORDER BY ${orderBy} LIMIT 1
   `;
			return rows.length ? options.schema.parse(rows[0]) : null;
		},
		async all(where: SqlFragment, orderBy = options.orderBy): Promise<Row[]> {
			const rows = await sql`
    SELECT ${options.selection} FROM ${table}
    WHERE ${where} ORDER BY ${orderBy}
   `;
			return decode(rows);
		},
	};
}
