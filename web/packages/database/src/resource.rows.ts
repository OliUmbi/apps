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
	const columns = new Map(
		definition.columns.map((column) => [column.name, column]),
	);
	return rows.map((row) =>
		Object.fromEntries(
			Object.entries(row).map(([name, value]) => {
				const column = columns.get(name);
				if (value === null) return [name, null];
				if (column?.dataType === "number") return [name, Number(value)];
				if (column?.dataType === "date")
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
