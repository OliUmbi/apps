import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofProductVariant = {
	table: "zelglihof.product_variant",
	columns: [
		{
			name: "product_id",
			dataType: "uuid",
		},
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "description",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "price",
			dataType: "text",
		},
		{
			name: "quantity",
			dataType: "number",
		},
	],
	public: "all",
} as const satisfies ResourceDefinition;
