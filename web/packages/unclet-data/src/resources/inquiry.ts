import type { ResourceDefinition } from "@oliumbi/contracts";

export const uncletInquiry = {
	table: "unclet.inquiry",
	columns: [
		{
			name: "status",
			dataType: "text",
		},
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "email",
			dataType: "text",
		},
		{
			name: "phone",
			dataType: "text",
		},
		{
			name: "event_on",
			dataType: "date",
		},
		{
			name: "location",
			dataType: "text",
		},
		{
			name: "guest_count",
			dataType: "number",
		},
		{
			name: "note",
			dataType: "text",
		},
	],
} as const satisfies ResourceDefinition;
