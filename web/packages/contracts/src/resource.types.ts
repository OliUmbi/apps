export type FieldKind =
	| "text"
	| "textarea"
	| "email"
	| "uuid"
	| "date"
	| "datetime-local"
	| "number"
	| "checkbox"
	| "status"
	| "slug";
export interface ResourceField {
	name: string;
	label: string;
	kind: FieldKind;
	nullable?: boolean;
	min?: number;
	max?: number;
	integer?: boolean;
	readOnly?: boolean;
}
export interface ResourceDefinition {
	table: string;
	label: string;
	fields: readonly ResourceField[];
	public?: "all" | "published" | "visible" | "active";
	create?: boolean;
	edit?: boolean;
	delete?: boolean;
	keys?: readonly string[];
	createDefaults?: ResourceRecord;
	editableWhen?: { field: string; value: RecordValue };
}
export type RecordValue = string | number | boolean | null;
export type ResourceRecord = Record<string, RecordValue>;
