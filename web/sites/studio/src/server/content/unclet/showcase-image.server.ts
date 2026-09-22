import type { Database, Transaction } from "@oliumbi/database";
import {
	type ShowcaseImageInput,
	type ShowcaseImageKey,
	showcaseImageSchema,
} from "../../../model/content/unclet/showcase-image";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function showcaseImageStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "unclet.showcase_image",
		selection: sql`showcase_id AS "showcaseId", image_id AS "imageId", description, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: showcaseImageSchema,
		keyColumns: (key: ShowcaseImageKey) => ({
			showcase_id: key.showcaseId,
			image_id: key.imageId,
		}),
		orderColumns: ["showcase_id", "image_id"],
		searchColumn: "description",
		writeColumns: (input: ShowcaseImageInput) => ({
			showcase_id: input.showcaseId,
			image_id: input.imageId,
			description: input.description,
		}),
	});
}
