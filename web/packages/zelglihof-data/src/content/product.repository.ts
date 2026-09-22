import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type ProductInput, type ProductKey, productSchema } from "./product";

export function createProductRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
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
