import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofArticleImage = {
	table: "zelglihof.article_image",
	columns: [
		{
			name: "article_id",
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
	keys: ["article_id", "image_id"],
} as const satisfies ResourceDefinition;
