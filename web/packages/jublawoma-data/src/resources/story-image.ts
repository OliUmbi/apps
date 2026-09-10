import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaStoryImage = {
	table: "jublawoma.story_image",
	label: "Geschichtenbilder",
	fields: [
		{
			name: "story_id",
			label: "story id",
			kind: "uuid",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
	keys: ["story_id", "image_id"],
} as const satisfies ResourceDefinition;
