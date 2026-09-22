import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofInquiry = {
	table: "zelglihof.inquiry",
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
			name: "phone",
			dataType: "text",
		},
		{
			name: "email",
			dataType: "text",
		},
		{
			name: "message",
			dataType: "text",
		},
	],
} as const satisfies ResourceDefinition;
