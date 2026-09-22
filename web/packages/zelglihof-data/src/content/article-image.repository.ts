import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type ArticleImageInput,
	type ArticleImageKey,
	articleImageSchema,
} from "./article-image";

export function createArticleImageRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "zelglihof.article_image",
		selection: sql`article_id AS "articleId", image_id AS "imageId", description, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: articleImageSchema,
		keyColumns: (key: ArticleImageKey) => ({
			article_id: key.articleId,
			image_id: key.imageId,
		}),
		orderColumns: ["article_id", "image_id"],
		searchColumn: "description",
		writeColumns: (input: ArticleImageInput) => ({
			article_id: input.articleId,
			image_id: input.imageId,
			description: input.description,
		}),
	});
	return {
		...repository,
		listForArticle(input: PageInput, articleId: string) {
			return repository.list(input, { article_id: articleId });
		},
	};
}
