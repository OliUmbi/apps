import { publicImageUrl } from "@oliumbi/assets/urls";
import {
	type Page,
	pageSchema,
	type ResourceRecord,
	slugSchema,
} from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import type { Update } from "@oliumbi/zelglihof-data/public.types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

function updateFromRecord(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): Update {
	return {
		id: String(record.id),
		slug: String(record.slug),
		title: String(record.title),
		description: String(record.description),
		body: String(record.body),
		image: record.image_id ? publicImageUrl(String(record.image_id)) : "",
		date: String(record.published_on ?? "").slice(0, 10),
		category: "Vom Hof",
		images: children.map((row) => ({
			id: String(row.image_id),
			src: row.image_id ? publicImageUrl(String(row.image_id)) : "",
			description: String(row.description),
		})),
	};
}

export const getUpdatePage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }): Promise<Page<Update>> => {
		const result = await createPublicRepository(database.sql).list(
			"zelglihof.article",
			data.page,
		);
		return {
			...result,
			items: result.items.map((row) => updateFromRecord(row)),
		};
	});

export const getUpdate = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(async ({ data }): Promise<Update | null> => {
		const result = await createPublicRepository(database.sql).detail(
			"zelglihof.article",
			data.slug,
			true,
		);
		return result ? updateFromRecord(result.record, result.children) : null;
	});
