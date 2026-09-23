import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { productVariant } from "../schema";
import type { ProductVariantInput, ProductVariantKey } from "./product-variant";

export function createProductVariantRepository(db: DatabaseExecutor) {
	return {
		async get(key: ProductVariantKey) {
			const [record] = await db
				.select()
				.from(productVariant)
				.where(eq(productVariant.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ProductVariantInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(productVariant)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: ProductVariantKey, input: ProductVariantInput) {
			const [record] = await db
				.update(productVariant)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(productVariant.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ProductVariantKey): Promise<void> {
			await db.delete(productVariant).where(eq(productVariant.id, key.id));
		},
		listForProduct(input: PageInput, productId: string) {
			return paginate(
				db
					.select()
					.from(productVariant)
					.where(
						and(
							eq(productVariant.productId, productId),
							input.search
								? ilike(productVariant.name, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(desc(productVariant.createdAt), productVariant.id)
					.$dynamic(),
				input,
			);
		},
	};
}
