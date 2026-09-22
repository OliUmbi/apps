import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type StoryInput, type StoryKey, storySchema } from "./story";

export function createStoryRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
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
