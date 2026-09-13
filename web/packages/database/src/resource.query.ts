import type { ResourceDefinition, ResourceRecord } from "@oliumbi/contracts";
import type { Database } from "./database.types";

export function resourceQuery(sql: Database, definition: ResourceDefinition) {
	const keys = definition.keys ?? ["id"];
	const columns = [
		...keys,
		...definition.fields.map((field) => field.name),
		"created_at",
		"updated_at",
	];
	return {
		table: sql(definition.table),
		columns: sql([...new Set(columns)]),
		order: sql(keys),
		key: (key: ResourceRecord) =>
			keys.length === 1
				? sql`${sql(keys[0])} = ${key[keys[0]]}`
				: sql`${sql(keys[0])} = ${key[keys[0]]} AND ${sql(keys[1])} = ${key[keys[1]]}`,
		editable: () =>
			definition.editableWhen
				? sql`${sql(definition.editableWhen.field)} = ${definition.editableWhen.value}`
				: sql`true`,
		search: (text: string) => {
			const field = definition.fields.find((field) =>
				["title", "name", "email", "subject"].includes(field.name),
			);
			return field && text
				? sql`${sql(field.name)} ILIKE ${`%${text.replace(/[\\%_]/g, "\\$&")}%`}`
				: sql`true`;
		},
		visibility: (publicOnly: boolean) =>
			publicVisibility(sql, definition, publicOnly),
	};
}
function publicVisibility(
	sql: Database,
	definition: ResourceDefinition,
	publicOnly: boolean,
) {
	if (!publicOnly) return sql`true`;
	switch (definition.public) {
		case "all":
			return sql`true`;
		case "published":
			return sql`published = true AND published_on <= current_date`;
		case "visible":
			return sql`visible = true`;
		case "active":
			return sql`starts_at <= now() AND ends_at >= now()`;
		default:
			throw new Error("Resource has no public read access");
	}
}
