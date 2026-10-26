import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { storyImage } from "../schema";
import type { StoryImage, StoryImageInput, StoryImageKey } from "./story-image";

export function createStoryImageRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		StoryImage,
		StoryImageKey,
		StoryImageInput
	>(db, {
		table: storyImage,
		name: "jublawoma.story_image",
		key: { storyId: storyImage.storyId, imageId: storyImage.imageId },
		// The composite key is the row's identity: values that claim another
		// identity are rejected instead of re-parenting or renaming the row.
		keyIsIdentity: true,
		search: storyImage.description,
		createdAt: storyImage.createdAt,
		updatedAt: storyImage.updatedAt,
		scope: storyImage.storyId,
	});
	return guardRepository({
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
		listForStory: store.listScoped,
	});
}
