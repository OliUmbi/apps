import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { productVariant } from "../schema";
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
		delete: store.delete,
		listForProduct: store.listScoped,
	});
}
