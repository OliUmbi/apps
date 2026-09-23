import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { showcaseImage } from "../schema";
import type { ShowcaseImageInput, ShowcaseImageKey } from "./showcase-image";

export function createShowcaseImageRepository(db: DatabaseExecutor) {
	return {
		async get(key: ShowcaseImageKey) {
			const [record] = await db
				.select()
				.from(showcaseImage)
				.where(
					and(
						eq(showcaseImage.showcaseId, key.showcaseId),
						eq(showcaseImage.imageId, key.imageId),
					),
				)
				.limit(1);
			return record ?? null;
		},
		async create(input: ShowcaseImageInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(showcaseImage)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: ShowcaseImageKey, input: ShowcaseImageInput) {
			const [record] = await db
				.update(showcaseImage)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(showcaseImage.showcaseId, key.showcaseId),
						eq(showcaseImage.imageId, key.imageId),
					),
				)
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ShowcaseImageKey): Promise<void> {
			await db
				.delete(showcaseImage)
				.where(
					and(
						eq(showcaseImage.showcaseId, key.showcaseId),
						eq(showcaseImage.imageId, key.imageId),
					),
				);
		},
		listForShowcase(input: PageInput, showcaseId: string) {
			return paginate(
				db
					.select()
					.from(showcaseImage)
					.where(
						and(
							eq(showcaseImage.showcaseId, showcaseId),
							input.search
								? ilike(showcaseImage.description, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(
						desc(showcaseImage.createdAt),
						showcaseImage.showcaseId,
						showcaseImage.imageId,
					)
					.$dynamic(),
				input,
			);
		},
	};
}
