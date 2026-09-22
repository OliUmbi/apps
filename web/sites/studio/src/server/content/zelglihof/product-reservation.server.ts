import type { Database, Transaction } from "@oliumbi/database";
import {
	type ProductReservationInput,
	type ProductReservationKey,
	productReservationSchema,
} from "../../../model/content/zelglihof/product-reservation";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function productReservationStore(
	sql: Database | Transaction = database.sql,
) {
	return createContentStore(sql, {
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
}
