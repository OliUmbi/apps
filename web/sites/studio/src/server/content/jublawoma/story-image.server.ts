import type { Database, Transaction } from "@oliumbi/database";
import {
	type StoryImageInput,
	type StoryImageKey,
	storyImageSchema,
} from "../../../model/content/jublawoma/story-image";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function storyImageStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "jublawoma.story_image",
		selection: sql`story_id AS "storyId", image_id AS "imageId", description, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: storyImageSchema,
		keyColumns: (key: StoryImageKey) => ({
			story_id: key.storyId,
			image_id: key.imageId,
		}),
		orderColumns: ["story_id", "image_id"],
		searchColumn: "description",
		writeColumns: (input: StoryImageInput) => ({
			story_id: input.storyId,
			image_id: input.imageId,
			description: input.description,
		}),
	});
}
