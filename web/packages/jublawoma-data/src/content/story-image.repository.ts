import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type StoryImageInput,
	type StoryImageKey,
	storyImageSchema,
} from "./story-image";

export function createStoryImageRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
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
	return {
		...repository,
		listForStory(input: PageInput, storyId: string) {
			return repository.list(input, { story_id: storyId });
		},
	};
}
