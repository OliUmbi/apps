import { AppError, guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { product } from "../schema";
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
		async delete(_key: ProductKey) {
			// Product deletion cascades through variants and orphans reservations.
			throw new AppError(
				"forbidden",
				"Products cannot be deleted while reservation lifecycle is unresolved; make the product unavailable instead",
			);
		},
	});
}
