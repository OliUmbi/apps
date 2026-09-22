import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaStory = {
	table: "jublawoma.story",
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
			name: "description",
			dataType: "text",
		},
		{
			name: "author",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "body",
			dataType: "text",
		},
		{
			name: "published",
			dataType: "boolean",
		},
		{
			name: "published_on",
			dataType: "date",
		},
	],
	public: "published",
} as const satisfies ResourceDefinition;
