import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { story } from "../schema";
import type { Story, StoryInput, StoryKey } from "./story";

export function createStoryRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Story, StoryKey, StoryInput>(db, {
		table: story,
		name: "jublawoma.story",
		key: { id: story.id },
		search: story.title,
		createdAt: story.createdAt,
		updatedAt: story.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
