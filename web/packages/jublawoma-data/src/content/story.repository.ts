import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { story } from "../schema";
import { updateMissError } from "./errors";
import type { Story, StoryInput, StoryKey } from "./story";

export function createStoryRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Story>> {
			return paginate<Story>(
				db
					.select()
					.from(story)
					.where(
						input.search
							? ilike(story.title, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(story.createdAt), story.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: StoryKey): Promise<Story | null> {
			const [record] = await db
				.select()
				.from(story)
				.where(eq(story.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: StoryInput): Promise<Story> {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(story)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: StoryKey, input: StoryInput, expectedUpdatedAt: string) {
			const [record] = await db
				.update(story)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(story.id, key.id), eq(story.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"jublawoma.story",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: StoryKey): Promise<void> {
			await db.delete(story).where(eq(story.id, key.id));
		},
	};
}
