import type { Database, Transaction } from "@oliumbi/database";
import {
	type ShowcaseInput,
	type ShowcaseKey,
	showcaseSchema,
} from "../../../model/content/unclet/showcase";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function showcaseStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "unclet.showcase",
		selection: sql`id, slug, title, location, guest_count AS "guestCount", image_id AS "imageId", published, published_on AS "publishedOn", body, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: showcaseSchema,
		keyColumns: (key: ShowcaseKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "title",
		writeColumns: (input: ShowcaseInput) => ({
			slug: input.slug,
			title: input.title,
			location: input.location,
			guest_count: input.guestCount,
			image_id: input.imageId,
			published: input.published,
			published_on: input.publishedOn,
			body: input.body,
		}),
	});
}
