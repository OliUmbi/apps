import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { promotion } from "../schema";
import type { PromotionInput, PromotionKey } from "./promotion";

export function createPromotionRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(promotion)
					.where(
						input.search
							? ilike(promotion.title, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(promotion.createdAt), promotion.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: PromotionKey) {
			const [record] = await db
				.select()
				.from(promotion)
				.where(eq(promotion.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: PromotionInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(promotion)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: PromotionKey, input: PromotionInput) {
			const [record] = await db
				.update(promotion)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(promotion.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: PromotionKey): Promise<void> {
			await db.delete(promotion).where(eq(promotion.id, key.id));
		},
	};
}
