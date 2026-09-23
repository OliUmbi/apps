import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { review } from "../schema";
import type { ReviewInput, ReviewKey } from "./review";

export function createReviewRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
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
		async get(key: ReviewKey) {
			const [record] = await db
				.select()
				.from(review)
				.where(eq(review.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ReviewInput) {
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
		async update(key: ReviewKey, input: ReviewInput) {
			const [record] = await db
				.update(review)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(review.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ReviewKey): Promise<void> {
			await db.delete(review).where(eq(review.id, key.id));
		},
	};
}
