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
			name: "detail",
			label: "detail",
			kind: "text",
			nullable: true,
			rows: 2,
		},
		{
			name: "quantity",
			label: "quantity",
			kind: "number",
			defaultValue: 1,
		},
		{
			name: "step",
			label: "step",
			kind: "number",
			min: 0.000001,
			defaultValue: 0.5,
		},
		{
			name: "unit",
			label: "unit",
			kind: "text",
			suggestions: [
				"Kilogram",
				"Liter",
				"Stück",
				"Packungen",
				"Tuben",
				"Gläser",
				"Franken",
			],
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
