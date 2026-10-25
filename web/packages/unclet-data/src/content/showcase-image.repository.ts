import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { showcaseImage } from "../schema";
import { RecordKeyMismatchError, updateMissError } from "./errors";
import type {
	ShowcaseImage,
	ShowcaseImageInput,
	ShowcaseImageKey,
} from "./showcase-image";

export function createShowcaseImageRepository(db: DatabaseExecutor) {
	return {
		async get(key: ShowcaseImageKey): Promise<ShowcaseImage | null> {
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
		async create(input: ShowcaseImageInput): Promise<ShowcaseImage> {
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
		async update(
			key: ShowcaseImageKey,
			input: ShowcaseImageInput,
			expectedUpdatedAt: string,
		): Promise<ShowcaseImage> {
			// The composite key is the row's identity: it is never written on update,
			// and values that claim another identity are rejected instead of silently
			// re-parenting or renaming the row.
			if (input.showcaseId !== key.showcaseId || input.imageId !== key.imageId)
				throw new RecordKeyMismatchError("unclet.showcase_image");
			const [record] = await db
				.update(showcaseImage)
				.set({
					description: input.description,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(showcaseImage.showcaseId, key.showcaseId),
						eq(showcaseImage.imageId, key.imageId),
						eq(showcaseImage.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"unclet.showcase_image",
					await this.get(key),
					expectedUpdatedAt,
				);
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
		listForShowcase(
			input: PageInput,
			showcaseId: string,
		): Promise<Page<ShowcaseImage>> {
			return paginate<ShowcaseImage>(
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
