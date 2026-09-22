import type { ResourceDefinition } from "@oliumbi/contracts";

export const uncletReview = {
	table: "unclet.review",
	columns: [
		{
			name: "stars",
			dataType: "number",
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
			name: "visible",
			dataType: "boolean",
		},
	],
	public: "visible",
} as const satisfies ResourceDefinition;
