import {
	type PageInput,
	pageResult,
	type ResourceDefinition,
	type ResourceRecord,
} from "@oliumbi/contracts";
import type { Database } from "./database.types";
import { resourceQuery } from "./resource-query";
import { type DatabaseRecord, serializeRows } from "./resource-rows";
export function createResourceReader(
	sql: Database,
	definition: ResourceDefinition,
) {
	const query = resourceQuery(sql, definition);
	const rows = (records: DatabaseRecord[]) =>
		serializeRows(records, definition);
	return {
		async list(input: PageInput, publicOnly = false) {
			const records = await sql<DatabaseRecord[]>`
				SELECT ${query.columns} FROM ${query.table}
				WHERE ${query.visibility(publicOnly)} AND ${query.search(input.search)}
				ORDER BY created_at DESC, ${query.order} DESC
				LIMIT ${input.size + 1} OFFSET ${input.page * input.size}
			`;
			return pageResult(rows(records), input);
		},
		async listRelated(input: PageInput, fieldName: string, value: string) {
			const field = definition.fields.find((field) => field.name === fieldName);
			if (field?.kind !== "uuid") throw new Error("Invalid resource relation");
			const records = await sql<DatabaseRecord[]>`
				SELECT ${query.columns} FROM ${query.table}
				WHERE ${sql(field.name)} = ${value} AND ${query.search(input.search)}
				ORDER BY created_at DESC, ${query.order} DESC
				LIMIT ${input.size + 1} OFFSET ${input.page * input.size}
			`;
			return pageResult(rows(records), input);
		},
		async find(key: ResourceRecord, publicOnly = false) {
			const records = await sql<DatabaseRecord[]>`
				SELECT ${query.columns} FROM ${query.table}
				WHERE ${query.key(key)} AND ${query.visibility(publicOnly)} LIMIT 1
			`;
			return rows(records)[0] ?? null;
		},
		async findBySlug(slug: string) {
			const records = await sql<DatabaseRecord[]>`
				SELECT ${query.columns} FROM ${query.table}
				WHERE slug=${slug} AND ${query.visibility(true)} LIMIT 1
			`;
			return rows(records)[0] ?? null;
		},
	};
}
