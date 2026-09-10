import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaDonationItem = {
	table: "jublawoma.donation_item",
	label: "Spendenbedarf",
	fields: [
		{
			name: "donation_id",
			label: "donation id",
			kind: "uuid",
		},
		{
			name: "name",
			label: "name",
			kind: "text",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
		{
			name: "quantity",
			label: "quantity",
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
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
