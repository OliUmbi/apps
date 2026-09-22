import type { Database, Transaction } from "@oliumbi/database";
import {
	type ArticleImageInput,
	type ArticleImageKey,
	articleImageSchema,
} from "../../../model/content/zelglihof/article-image";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function articleImageStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
}
