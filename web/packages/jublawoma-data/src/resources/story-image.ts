import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaStoryImage = {
	table: "jublawoma.story_image",
	columns: [
		{
			name: "story_id",
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
	keys: ["story_id", "image_id"],
} as const satisfies ResourceDefinition;
