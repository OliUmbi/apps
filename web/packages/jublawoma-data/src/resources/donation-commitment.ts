import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaDonationCommitment = {
	table: "jublawoma.donation_commitment",
	label: "Zusagen",
	fields: [
		{
			name: "donation_id",
			label: "donation id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "donation_item_id",
			label: "donation item id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "donation_title",
			label: "donation title",
			kind: "text",
		},
		{
			name: "item_name",
			label: "item name",
			kind: "text",
		},
		{
			name: "item_description",
			label: "item description",
			kind: "text",
		},
		{
			name: "item_quantity",
			label: "item quantity",
			kind: "number",
		},
		{
			name: "step",
			label: "step",
			kind: "number",
			min: 0.000001,
		},
		{
			name: "unit",
			label: "unit",
			kind: "text",
		},
		{
			name: "name",
			label: "name",
			kind: "text",
		},
		{
			name: "phone",
			label: "phone",
			kind: "text",
		},
		{
			name: "quantity",
			label: "quantity",
			kind: "number",
		},
		{
			name: "note",
			label: "note",
			kind: "textarea",
			nullable: true,
		},
	],
	create: false,
	edit: false,
	delete: true,
} as const satisfies ResourceDefinition;
