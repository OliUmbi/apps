import { AppError, guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { and, eq, isNull } from "drizzle-orm";
import { product } from "../schema";
import { updateMissError } from "./errors";
import type { Product, ProductInput, ProductKey } from "./product";

export function createProductRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Product, ProductKey, ProductInput>(db, {
		table: product,
		name: "zelglihof.product",
		key: { id: product.id },
		search: product.name,
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		async archive(
			key: ProductKey,
			expectedUpdatedAt: string,
			actor: string,
		): Promise<Product> {
			const now = new Date().toISOString();
			const [record] = await db
				.update(product)
				.set({ archivedAt: now, archivedBy: actor, updatedAt: now })
				.where(
					and(
						eq(product.id, key.id),
						isNull(product.archivedAt),
						eq(product.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (record) return record as Product;
			// A row that is already archived is a guard-skip, a stale token a
			// conflict: the shared miss classifier tells them apart.
			throw updateMissError(
				"zelglihof.product",
				await store.get(key),
				expectedUpdatedAt,
			);
		},
		async delete(_key: ProductKey) {
			// Product deletion cascades through variants and orphans reservations.
			throw new AppError(
				"forbidden",
				"Products cannot be deleted while reservation lifecycle is unresolved; make the product unavailable instead",
			);
		},
	});
}
