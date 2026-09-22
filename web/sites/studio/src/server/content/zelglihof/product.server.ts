import type { Database, Transaction } from "@oliumbi/database";
import {
	type ProductInput,
	type ProductKey,
	productSchema,
} from "../../../model/content/zelglihof/product";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function productStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "zelglihof.product",
		selection: sql`id, name, description, body, image_id AS "imageId", visible, reservable, starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: productSchema,
		keyColumns: (key: ProductKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: ProductInput) => ({
			name: input.name,
			description: input.description,
			body: input.body,
			image_id: input.imageId,
			visible: input.visible,
			reservable: input.reservable,
			starts_at: input.startsAt,
			ends_at: input.endsAt,
		}),
	});
}
