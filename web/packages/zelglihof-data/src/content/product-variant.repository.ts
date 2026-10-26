import {
	guardRepository,
	type Page,
	type PageInput,
	recordNotCreatedError,
} from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { productVariant } from "../schema";
import { updateMissError } from "./errors";
import type {
	ProductVariant,
	ProductVariantInput,
	ProductVariantKey,
} from "./product-variant";

export function createProductVariantRepository(db: DatabaseExecutor) {
	return guardRepository({
		async get(key: ProductVariantKey): Promise<ProductVariant | null> {
			const [record] = await db
				.select()
				.from(productVariant)
				.where(eq(productVariant.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ProductVariantInput): Promise<ProductVariant> {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(productVariant)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw recordNotCreatedError();
			return record;
		},
		async update(
			key: ProductVariantKey,
			input: ProductVariantInput,
			expectedUpdatedAt: string,
		): Promise<ProductVariant> {
			// The parent reference is an identity column: it is never written on
			// update, so a variant cannot be moved to another product by a
			// key/values mismatch.
			const [record] = await db
				.update(productVariant)
				.set({
					name: input.name,
					description: input.description,
					imageId: input.imageId,
					price: input.price,
					quantity: input.quantity,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(productVariant.id, key.id),
						eq(productVariant.productId, input.productId),
						eq(productVariant.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (record) return record;
			const current = await this.get(key);
			throw updateMissError(
				"zelglihof.product_variant",
				current,
				expectedUpdatedAt,
				current?.productId === input.productId,
			);
		},
		async delete(key: ProductVariantKey): Promise<void> {
			await db.delete(productVariant).where(eq(productVariant.id, key.id));
		},
		listForProduct(
			input: PageInput,
			productId: string,
		): Promise<Page<ProductVariant>> {
			return paginate<ProductVariant>(
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
	});
}
