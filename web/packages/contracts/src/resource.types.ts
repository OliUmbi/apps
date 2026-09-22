export interface ResourceColumn {
	name: string;
	dataType: "text" | "number" | "boolean" | "uuid" | "date" | "timestamp";
}
export interface ResourceDefinition {
	table: string;
	columns: readonly ResourceColumn[];
	public?: "all" | "published" | "visible" | "active";
	keys?: readonly string[];
}
export type RecordValue = string | number | boolean | null;
export type ResourceRecord = Record<string, RecordValue>;
