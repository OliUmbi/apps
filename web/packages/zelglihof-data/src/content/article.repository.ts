import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type ArticleInput, type ArticleKey, articleSchema } from "./article";

export function createArticleRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
		table: "zelglihof.article",
		selection: sql`id, slug, title, description, image_id AS "imageId", body, published, published_on AS "publishedOn", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: articleSchema,
		keyColumns: (key: ArticleKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "title",
		writeColumns: (input: ArticleInput) => ({
			slug: input.slug,
			title: input.title,
			description: input.description,
			image_id: input.imageId,
			body: input.body,
			published: input.published,
			published_on: input.publishedOn,
		}),
	});
}
