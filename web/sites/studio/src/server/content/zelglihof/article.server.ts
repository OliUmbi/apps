import type { Database, Transaction } from "@oliumbi/database";
import {
	type ArticleInput,
	type ArticleKey,
	articleSchema,
} from "../../../model/content/zelglihof/article";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function articleStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
