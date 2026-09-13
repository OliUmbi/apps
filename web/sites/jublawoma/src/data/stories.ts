import {
	type Page,
	pageSchema,
	type ResourceRecord,
	slugSchema,
} from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { StoryRecord } from "@oliumbi/jublawoma-data/public.types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";
import { mediaFromRecord } from "./media";

function storyFromRecord(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): StoryRecord {
	return {
		id: String(record.id),
		slug: String(record.slug),
		title: String(record.title),
		summary: String(record.description),
		bodyMarkdown: String(record.body),
		author: String(record.author),
		publishedOn: record.published_on
			? String(record.published_on).slice(0, 10)
			: null,
		media: mediaFromRecord(record, children),
	};
}

export const getStory = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(async ({ data }) => {
		const result = await createPublicRepository(database.sql).detail(
			"jublawoma.story",
			data.slug,
			true,
		);
		return result ? storyFromRecord(result.record, result.children) : null;
	});

export const getStoryPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }): Promise<Page<StoryRecord>> => {
		const result = await createPublicRepository(database.sql).list(
			"jublawoma.story",
			data.page,
		);
		return {
			...result,
			items: result.items.map((record) => storyFromRecord(record)),
		};
	});
