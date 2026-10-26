import { guardRepository } from "@oliumbi/contracts";
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
		delete: store.delete,
	});
}
