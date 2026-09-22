import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type ProductReservationInput,
	type ProductReservationKey,
	productReservationSchema,
} from "./product-reservation";

export function createProductReservationRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "zelglihof.product_reservation",
		selection: sql`id, product_id AS "productId", product_variant_id AS "productVariantId", product_name AS "productName", variant_name AS "variantName", variant_description AS "variantDescription", variant_quantity AS "variantQuantity", variant_price AS "variantPrice", name, phone, email, quantity, note, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: productReservationSchema,
		keyColumns: (key: ProductReservationKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: ProductReservationInput) => ({
			status: input.status,
		}),
	});
	return {
		read: repository.read,
		list: repository.list,
		get: repository.get,
		update: repository.update,
		delete: repository.delete,
		listForProduct(input: PageInput, productId: string) {
			return repository.list(input, { product_id: productId });
		},
	};
}
