import type { ResourceDefinition, ResourceRecord } from "@oliumbi/contracts";
import type { Database } from "./database.types";
import { resourceQuery } from "./resource-query";
import { type DatabaseRecord, serializeRows } from "./resource-rows";
export function createResourceWriter(
	sql: Database,
	definition: ResourceDefinition,
) {
	const query = resourceQuery(sql, definition);
	return {
		async create(values: ResourceRecord) {
			const now = new Date();
			const records = await sql<DatabaseRecord[]>`
				INSERT INTO ${query.table} ${sql({ ...values, created_at: now, updated_at: now })}
				RETURNING ${query.columns}
			`;
			return serializeRows(records, definition)[0];
		},
		async update(key: ResourceRecord, values: ResourceRecord) {
			const records = await sql<DatabaseRecord[]>`
				UPDATE ${query.table} SET ${sql({ ...values, updated_at: new Date() })}
				WHERE ${query.key(key)} AND ${query.editable()}
				RETURNING ${query.columns}
			`;
			if (!records.length)
				throw new Error("Record not found or no longer editable");
			return serializeRows(records, definition)[0];
		},
		async delete(key: ResourceRecord) {
			await sql`DELETE FROM ${query.table} WHERE ${query.key(key)}`;
		},
	};
}
