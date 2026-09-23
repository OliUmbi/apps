import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { storyImage } from "../schema";
import type { StoryImageInput, StoryImageKey } from "./story-image";

export function createStoryImageRepository(db: DatabaseExecutor) {
	return {
		async get(key: StoryImageKey) {
			const [record] = await db
				.select()
				.from(storyImage)
				.where(
					and(
						eq(storyImage.storyId, key.storyId),
						eq(storyImage.imageId, key.imageId),
					),
				)
				.limit(1);
			return record ?? null;
		},
		async create(input: StoryImageInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(storyImage)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: StoryImageKey, input: StoryImageInput) {
			const [record] = await db
				.update(storyImage)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(storyImage.storyId, key.storyId),
						eq(storyImage.imageId, key.imageId),
					),
				)
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: StoryImageKey): Promise<void> {
			await db
				.delete(storyImage)
				.where(
					and(
						eq(storyImage.storyId, key.storyId),
						eq(storyImage.imageId, key.imageId),
					),
				);
		},
		listForStory(input: PageInput, storyId: string) {
			return paginate(
				db
					.select()
					.from(storyImage)
					.where(
						and(
							eq(storyImage.storyId, storyId),
							input.search
								? ilike(storyImage.description, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(
						desc(storyImage.createdAt),
						storyImage.storyId,
						storyImage.imageId,
					)
					.$dynamic(),
				input,
			);
		},
	};
}
