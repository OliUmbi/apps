import type {
	RecordValue,
	ResourceDefinition,
	ResourceRecord,
} from "@oliumbi/contracts";
export type DatabaseRecord = Record<string, RecordValue | Date>;
export function serializeRows(
	rows: DatabaseRecord[],
	definition: ResourceDefinition,
): ResourceRecord[] {
	const fields = new Map(definition.fields.map((field) => [field.name, field]));
	return rows.map((row) =>
		Object.fromEntries(
			Object.entries(row).map(([name, value]) => {
				const field = fields.get(name);
				if (value === null) return [name, null];
				if (field?.kind === "number") return [name, Number(value)];
				if (field?.kind === "date")
					return [
						name,
						(value instanceof Date ? value.toISOString() : String(value)).slice(
							0,
							10,
						),
					];
				return [name, value instanceof Date ? value.toISOString() : value];
			}),
		),
	);
}
