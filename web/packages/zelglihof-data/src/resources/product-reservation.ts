import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofProductReservation = {
	table: "zelglihof.product_reservation",
	columns: [
		{
			name: "product_id",
			dataType: "uuid",
		},
		{
			name: "product_variant_id",
			dataType: "uuid",
		},
		{
			name: "product_name",
			dataType: "text",
		},
		{
			name: "variant_name",
			dataType: "text",
		},
		{
			name: "variant_description",
			dataType: "text",
		},
		{
			name: "variant_quantity",
			dataType: "number",
		},
		{
			name: "variant_price",
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
			name: "email",
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
		{
			name: "status",
			dataType: "text",
		},
	],
} as const satisfies ResourceDefinition;
