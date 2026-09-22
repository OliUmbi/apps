import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type ProductVariantInput,
	type ProductVariantKey,
	productVariantSchema,
} from "./product-variant";

export function createProductVariantRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "zelglihof.product_variant",
		selection: sql`id, product_id AS "productId", name, description, image_id AS "imageId", price, quantity, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: productVariantSchema,
		keyColumns: (key: ProductVariantKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: ProductVariantInput) => ({
			product_id: input.productId,
			name: input.name,
			description: input.description,
			image_id: input.imageId,
			price: input.price,
			quantity: input.quantity,
		}),
	});
	return {
		...repository,
		listForProduct(input: PageInput, productId: string) {
			return repository.list(input, { product_id: productId });
		},
	};
}
