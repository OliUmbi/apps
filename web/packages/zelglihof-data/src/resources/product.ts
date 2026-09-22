import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofProduct = {
	table: "zelglihof.product",
	columns: [
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "description",
			dataType: "text",
		},
		{
			name: "body",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "visible",
			dataType: "boolean",
		},
		{
			name: "reservable",
			dataType: "boolean",
		},
		{
			name: "starts_at",
			dataType: "timestamp",
		},
		{
			name: "ends_at",
			dataType: "timestamp",
		},
	],
	public: "visible",
} as const satisfies ResourceDefinition;
