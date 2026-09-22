import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofPromotion = {
	table: "zelglihof.promotion",
	columns: [
		{
			name: "title",
			dataType: "text",
		},
		{
			name: "description",
			dataType: "text",
		},
		{
			name: "link",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
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
	public: "active",
} as const satisfies ResourceDefinition;
