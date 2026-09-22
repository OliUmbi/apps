import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaDonationCommitment = {
	table: "jublawoma.donation_commitment",
	columns: [
		{
			name: "donation_id",
			dataType: "uuid",
		},
		{
			name: "donation_item_id",
			dataType: "uuid",
		},
		{
			name: "donation_title",
			dataType: "text",
		},
		{
			name: "item_name",
			dataType: "text",
		},
		{
			name: "item_detail",
			dataType: "text",
		},
		{
			name: "item_quantity",
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
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "phone",
			dataType: "text",
		},
		{
			name: "quantity",
			dataType: "number",
		},
		{
			name: "note",
			dataType: "text",
		},
	],
} as const satisfies ResourceDefinition;
