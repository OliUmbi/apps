import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { promotion } from "../schema";
import { updateMissError } from "./errors";
import type { Promotion, PromotionInput, PromotionKey } from "./promotion";

export function createPromotionRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Promotion>> {
			return paginate<Promotion>(
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
		async get(key: PromotionKey): Promise<Promotion | null> {
			const [record] = await db
				.select()
				.from(promotion)
				.where(eq(promotion.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: PromotionInput): Promise<Promotion> {
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
		async update(
			key: PromotionKey,
			input: PromotionInput,
			expectedUpdatedAt: string,
		): Promise<Promotion> {
			const [record] = await db
				.update(promotion)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(promotion.id, key.id),
						eq(promotion.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"jublawoma.promotion",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: PromotionKey): Promise<void> {
			await db.delete(promotion).where(eq(promotion.id, key.id));
		},
	};
}
