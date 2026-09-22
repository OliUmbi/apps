import type { ResourceDefinition } from "@oliumbi/contracts";

export const uncletShowcase = {
	table: "unclet.showcase",
	columns: [
		{
			name: "slug",
			dataType: "text",
		},
		{
			name: "title",
			dataType: "text",
		},
		{
			name: "location",
			dataType: "text",
		},
		{
			name: "guest_count",
			dataType: "number",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "published",
			dataType: "boolean",
		},
		{
			name: "published_on",
			dataType: "date",
		},
		{
			name: "body",
			dataType: "text",
		},
	],
	public: "published",
} as const satisfies ResourceDefinition;
