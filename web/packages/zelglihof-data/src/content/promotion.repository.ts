import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type PromotionInput,
	type PromotionKey,
	promotionSchema,
} from "./promotion";

export function createPromotionRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
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
