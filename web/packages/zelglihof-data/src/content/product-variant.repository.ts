import { AppError, guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { and, eq, isNull } from "drizzle-orm";
import { productVariant } from "../schema";
import { updateMissError } from "./errors";
import type {
	ProductVariant,
	ProductVariantInput,
	ProductVariantKey,
} from "./product-variant";

export function createProductVariantRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		ProductVariant,
		ProductVariantKey,
		ProductVariantInput
	>(db, {
		table: productVariant,
		name: "zelglihof.product_variant",
		key: { id: productVariant.id },
		search: productVariant.name,
		createdAt: productVariant.createdAt,
		updatedAt: productVariant.updatedAt,
		scope: productVariant.productId,
		// The parent reference is an identity column: a variant cannot be moved to
		// another product by a key/values mismatch.
		parent: { column: productVariant.productId, field: "productId" },
	});
	return guardRepository({
		get: store.get,
		create: store.create,
		update: store.update,
		async archive(
			key: ProductVariantKey,
			expectedUpdatedAt: string,
			actor: string,
		): Promise<ProductVariant> {
			const now = new Date().toISOString();
			const [record] = await db
				.update(productVariant)
				.set({ archivedAt: now, archivedBy: actor, updatedAt: now })
				.where(
					and(
						eq(productVariant.id, key.id),
						isNull(productVariant.archivedAt),
						eq(productVariant.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (record) return record as ProductVariant;
			throw updateMissError(
				"zelglihof.product_variant",
				await store.get(key),
				expectedUpdatedAt,
			);
		},
		async delete(_key: ProductVariantKey) {
			// Reservations keep snapshots, but deleting a variant also destroys the
			// stock row that a future cancellation policy would need to restore.
			throw new AppError(
				"forbidden",
				"Product variants cannot be deleted while reservation history depends on them",
			);
		},
		listForProduct: store.listScoped,
	});
}
