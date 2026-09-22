import type { Database, Transaction } from "@oliumbi/database";
import {
	type PromotionInput,
	type PromotionKey,
	promotionSchema,
} from "../../../model/content/zelglihof/promotion";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function promotionStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "zelglihof.promotion",
		selection: sql`id, title, description, link, image_id AS "imageId", starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: promotionSchema,
		keyColumns: (key: PromotionKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "title",
		writeColumns: (input: PromotionInput) => ({
			title: input.title,
			description: input.description,
			link: input.link,
			image_id: input.imageId,
			starts_at: input.startsAt,
			ends_at: input.endsAt,
		}),
	});
}
