import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaDonationItem = {
	table: "jublawoma.donation_item",
	columns: [
		{
			name: "donation_id",
			dataType: "uuid",
		},
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "detail",
			dataType: "text",
		},
		{
			name: "quantity",
			dataType: "number",
		},
		{
			name: "step",
			dataType: "number",
		},
		{
			name: "unit",
			dataType: "text",
		},
	],
	public: "all",
} as const satisfies ResourceDefinition;
