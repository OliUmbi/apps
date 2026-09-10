import {
	pageSchema,
	type ResourceDefinition,
	type ResourceRecord,
} from "@oliumbi/contracts";
import type { Database } from "./index";
import { createResourceRepository } from "./resource.repository";

export function createPublicRepository(
	sql: Database,
	relations: Record<string, { table: string; column: string }>,
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
				? await sql<ResourceRecord[]>`
					SELECT *
					FROM ${sql(relation.table)}
					WHERE ${sql(relation.column)} = ${record.id}
					ORDER BY created_at
				`
				: [];
			return {
				record,
				children: children.map((row) =>
					Object.fromEntries(
						Object.entries(row).map(([key, value]) => [
							key,
							key.endsWith("_at") ? String(value) : value,
						]),
					),
				),
			};
		},
	};
}
