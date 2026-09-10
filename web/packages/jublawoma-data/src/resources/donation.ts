import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaDonation = {
	table: "jublawoma.donation",
	label: "Spendenaktionen",
	fields: [
		{
			name: "title",
			label: "title",
			kind: "text",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
		{
			name: "contact",
			label: "contact",
			kind: "text",
		},
		{
			name: "starts_at",
			label: "starts at",
			kind: "datetime-local",
		},
		{
			name: "ends_at",
			label: "ends at",
			kind: "datetime-local",
		},
	],
	public: "active",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
