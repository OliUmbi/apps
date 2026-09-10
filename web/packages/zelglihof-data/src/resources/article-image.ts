import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofArticleImage = {
	table: "zelglihof.article_image",
	label: "Artikelbilder",
	fields: [
		{
			name: "article_id",
			label: "article id",
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
	keys: ["article_id", "image_id"],
} as const satisfies ResourceDefinition;
