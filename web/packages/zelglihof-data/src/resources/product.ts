import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofProduct = {
	table: "zelglihof.product",
	label: "Produkte",
	fields: [
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
			name: "body",
			label: "body",
			kind: "textarea",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "visible",
			label: "visible",
			kind: "checkbox",
		},
		{
			name: "reservable",
			label: "reservable",
			kind: "checkbox",
		},
		{
			name: "starts_at",
			label: "starts at",
			kind: "datetime-local",
			nullable: true,
		},
		{
			name: "ends_at",
			label: "ends at",
			kind: "datetime-local",
			nullable: true,
		},
	],
	public: "visible",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
