import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { storyImage } from "../schema";
import { RecordKeyMismatchError, updateMissError } from "./errors";
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
		async update(
			key: StoryImageKey,
			input: StoryImageInput,
			expectedUpdatedAt: string,
		) {
			// The composite key is the row's identity: it is never written on update,
			// and values that claim another identity are rejected instead of silently
			// re-parenting or renaming the row.
			if (input.storyId !== key.storyId || input.imageId !== key.imageId)
				throw new RecordKeyMismatchError("jublawoma.story_image");
			const [record] = await db
				.update(storyImage)
				.set({
					description: input.description,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(storyImage.storyId, key.storyId),
						eq(storyImage.imageId, key.imageId),
						eq(storyImage.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"jublawoma.story_image",
					await this.get(key),
					expectedUpdatedAt,
				);
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
