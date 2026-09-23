import { pageSchema, slugSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { Story } from "@oliumbi/jublawoma-data/content/story";
import type { StoryImage } from "@oliumbi/jublawoma-data/content/story-image";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StoryRecord } from "../model/content";
import { database } from "../server/database.server";
import { mediaFromImages } from "./media";

function storyFromRecord(
	record: Story,
	images: StoryImage[] = [],
): StoryRecord {
	return {
		id: record.id,
		slug: record.slug,
		title: record.title,
		summary: record.description,
		bodyMarkdown: record.body,
		author: record.author,
		publishedOn: record.publishedOn,
		media: mediaFromImages(record.imageId, record.title, images),
	};
}
export const getStory = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(async ({ data }) => {
		const result = await createPublicRepository(database.db).findStory(
			data.slug,
		);
		return result ? storyFromRecord(result.story, result.images) : null;
	});
export const getStoryPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listStories(
			data.page,
		);
		return {
			...page,
			items: page.items.map((story) => storyFromRecord(story)),
		};
	});
