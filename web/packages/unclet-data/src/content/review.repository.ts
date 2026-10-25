import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { review } from "../schema";
import { updateMissError } from "./errors";
import type { Review, ReviewInput, ReviewKey } from "./review";

export function createReviewRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Review>> {
			return paginate<Review>(
				db
					.select()
					.from(review)
					.where(
						input.search
							? ilike(review.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(review.createdAt), review.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: ReviewKey): Promise<Review | null> {
			const [record] = await db
				.select()
				.from(review)
				.where(eq(review.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ReviewInput): Promise<Review> {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(review)
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
			key: ReviewKey,
			input: ReviewInput,
			expectedUpdatedAt: string,
		): Promise<Review> {
			const [record] = await db
				.update(review)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(review.id, key.id), eq(review.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"unclet.review",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ReviewKey): Promise<void> {
			await db.delete(review).where(eq(review.id, key.id));
		},
	};
}
