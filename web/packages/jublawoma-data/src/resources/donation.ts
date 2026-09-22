import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaDonation = {
	table: "jublawoma.donation",
	columns: [
		{
			name: "title",
			dataType: "text",
		},
		{
			name: "description",
			dataType: "text",
		},
		{
			name: "contact",
			dataType: "text",
		},
		{
			name: "starts_at",
			dataType: "timestamp",
		},
		{
			name: "ends_at",
			dataType: "timestamp",
		},
	],
	public: "active",
} as const satisfies ResourceDefinition;
