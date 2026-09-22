import type { Database, Transaction } from "@oliumbi/database";
import {
	type StoryInput,
	type StoryKey,
	storySchema,
} from "../../../model/content/jublawoma/story";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function storyStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "jublawoma.story",
		selection: sql`id, slug, title, description, author, image_id AS "imageId", body, published, published_on AS "publishedOn", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: storySchema,
		keyColumns: (key: StoryKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "title",
		writeColumns: (input: StoryInput) => ({
			slug: input.slug,
			title: input.title,
			description: input.description,
			author: input.author,
			image_id: input.imageId,
			body: input.body,
			published: input.published,
			published_on: input.publishedOn,
		}),
	});
}
