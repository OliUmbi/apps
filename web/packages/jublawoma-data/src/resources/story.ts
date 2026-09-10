import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaStory = {
	table: "jublawoma.story",
	label: "Geschichten",
	fields: [
		{
			name: "slug",
			label: "slug",
			kind: "slug",
		},
		{
			name: "title",
			label: "title",
			kind: "text",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
		{
			name: "author",
			label: "author",
			kind: "text",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "body",
			label: "body",
			kind: "textarea",
		},
		{
			name: "published",
			label: "published",
			kind: "checkbox",
		},
		{
			name: "published_on",
			label: "published on",
			kind: "date",
			nullable: true,
		},
	],
	public: "published",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
