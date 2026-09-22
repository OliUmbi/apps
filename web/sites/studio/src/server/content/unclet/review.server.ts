import type { Database, Transaction } from "@oliumbi/database";
import {
	type ReviewInput,
	type ReviewKey,
	reviewSchema,
} from "../../../model/content/unclet/review";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function reviewStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
