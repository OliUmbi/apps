import { pageSchema, type ResourceDefinition } from "@oliumbi/contracts";
import type { Database } from "./database.types";
import { resourceQuery } from "./resource.query";
import { createResourceReader } from "./resource.reader";
import { type DatabaseRecord, serializeRows } from "./resource.rows";

export interface PublicRelation {
	resource: ResourceDefinition;
	column: string;
}

export function createPublicRepository(
	sql: Database,
	relations: Readonly<Record<string, PublicRelation>>,
) {
	return {
		list: (resource: ResourceDefinition, page = 0) =>
			createResourceReader(sql, resource).list(
				pageSchema.parse({ page }),
				true,
			),
		async detail(resource: ResourceDefinition, value: string, bySlug = false) {
			if (bySlug && !resource.columns.some((field) => field.name === "slug"))
				throw new Error("This resource has no slug");
			const repository = createResourceReader(sql, resource);
			const record = bySlug
				? await repository.findBySlug(value)
				: await repository.find({ id: value }, true);
			if (!record) return null;
			const relation = relations[resource.table];
			if (!relation) return { record, children: [] };
			const query = resourceQuery(sql, relation.resource);
			const children = await sql<DatabaseRecord[]>`
    SELECT ${query.columns} FROM ${query.table}
    WHERE ${sql(relation.column)} = ${record.id} AND ${query.visibility(true)}
    ORDER BY created_at, ${query.order}
   `;
			return { record, children: serializeRows(children, relation.resource) };
		},
	};
}
