import type { Database, Transaction } from "@oliumbi/database";
import {
	type ProductVariantInput,
	type ProductVariantKey,
	productVariantSchema,
} from "../../../model/content/zelglihof/product-variant";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function productVariantStore(
	sql: Database | Transaction = database.sql,
) {
	return createContentStore(sql, {
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
}
