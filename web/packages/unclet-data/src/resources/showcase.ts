import type { ResourceDefinition } from "@oliumbi/contracts";
export const uncletShowcase = {
	table: "unclet.showcase",
	label: "Einblicke",
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
			name: "location",
			label: "location",
			kind: "text",
		},
		{
			name: "guest_count",
			label: "guest count",
			kind: "number",
			integer: true,
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
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
		{
			name: "body",
			label: "body",
			kind: "textarea",
			nullable: true,
		},
	],
	public: "published",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
