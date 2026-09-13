import {
	pageSchema,
	type ResourceDefinition,
	type ResourceRecord,
} from "@oliumbi/contracts";
import type { Database } from "./index";
import { createResourceRepository } from "./resource.repository";

export interface PublicRelation {
	table: string;
	column: string;
}

export function createPublicRepository(
	sql: Database,
	relations: Readonly<Record<string, PublicRelation>>,
) {
	return {
		list: (resource: ResourceDefinition, page = 0) =>
			createResourceRepository(sql, resource).list(
				pageSchema.parse({ page }),
				true,
			),
		async detail(resource: ResourceDefinition, value: string, bySlug = false) {
			if (bySlug && !resource.fields.some((field) => field.name === "slug"))
				throw new Error("This resource has no slug");
			const repository = createResourceRepository(sql, resource);
			const record = bySlug
				? await repository.findBySlug(value)
				: await repository.find({ id: value }, true);
			if (!record) return null;
			const relation = relations[resource.table];
			const children = relation
				? normalizeRecords(
						await sql<ResourceRecord[]>`
					SELECT *
					FROM ${sql(relation.table)}
					WHERE ${sql(relation.column)} = ${record.id}
					ORDER BY created_at
				`,
					)
				: [];
			return { record, children };
		},
	};
}

function normalizeRecords(records: ResourceRecord[]) {
	return records.map((record) =>
		Object.fromEntries(
			Object.entries(record).map(([key, value]) => [
				key,
				key.endsWith("_at") ? String(value) : value,
			]),
		),
	);
}
