import type { ResourceDefinition } from "@oliumbi/contracts";
export const uncletInquiry = {
	table: "unclet.inquiry",
	label: "Anfragen",
	fields: [
		{
			name: "status",
			label: "status",
			kind: "status",
		},
		{
			name: "name",
			label: "name",
			kind: "text",
			readOnly: true,
		},
		{
			name: "email",
			label: "email",
			kind: "email",
			readOnly: true,
		},
		{
			name: "phone",
			label: "phone",
			kind: "text",
			readOnly: true,
		},
		{
			name: "event_on",
			label: "event on",
			kind: "date",
			nullable: true,
			readOnly: true,
		},
		{
			name: "location",
			label: "location",
			kind: "text",
			nullable: true,
			readOnly: true,
		},
		{
			name: "guest_count",
			label: "guest count",
			kind: "number",
			nullable: true,
			integer: true,
			readOnly: true,
		},
		{
			name: "note",
			label: "note",
			kind: "textarea",
			nullable: true,
			readOnly: true,
		},
	],
	create: false,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
