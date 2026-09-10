import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofProductVariant = {
	table: "zelglihof.product_variant",
	label: "Varianten",
	fields: [
		{
			name: "product_id",
			label: "product id",
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
			nullable: true,
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "price",
			label: "price",
			kind: "text",
		},
		{
			name: "quantity",
			label: "quantity",
			kind: "number",
			nullable: true,
			integer: true,
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
