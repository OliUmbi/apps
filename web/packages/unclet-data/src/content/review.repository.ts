import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type ReviewInput, type ReviewKey, reviewSchema } from "./review";

export function createReviewRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
		table: "unclet.review",
		selection: sql`id, stars, name, description, visible, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: reviewSchema,
		keyColumns: (key: ReviewKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: ReviewInput) => ({
			stars: input.stars,
			name: input.name,
			description: input.description,
			visible: input.visible,
		}),
	});
}
