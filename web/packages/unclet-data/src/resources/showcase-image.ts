import type { ResourceDefinition } from "@oliumbi/contracts";

export const uncletShowcaseImage = {
	table: "unclet.showcase_image",
	columns: [
		{
			name: "showcase_id",
			dataType: "uuid",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "description",
			dataType: "text",
		},
	],
	public: "all",
	keys: ["showcase_id", "image_id"],
} as const satisfies ResourceDefinition;
