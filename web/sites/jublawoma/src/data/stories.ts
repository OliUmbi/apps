import { pageSchema, slugSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { Story } from "@oliumbi/jublawoma-data/content/story";
import type { StoryImage } from "@oliumbi/jublawoma-data/content/story-image";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PublicStory, StorySummary } from "../model/content";
import { database } from "../server/database.server";
import { imageFromId } from "./images";

function storySummaryFromRecord(record: Story): StorySummary {
	return {
		id: record.id,
		slug: record.slug,
		title: record.title,
		description: record.description,
		publishedOn: record.publishedOn,
		image: record.imageId ? imageFromId(record.imageId, record.title) : null,
	};
}
function storyFromRecord(record: Story, images: StoryImage[]): PublicStory {
	const summary = storySummaryFromRecord(record);
	const gallery = images.map((image) =>
		imageFromId(image.imageId, image.description),
	);
	const cover = summary.image ?? gallery[0] ?? null;
	return {
		...summary,
		body: record.body,
		author: record.author,
		image: cover,
		gallery: gallery.filter((image) => image.id !== cover?.id),
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
			items: page.items.map(storySummaryFromRecord),
		};
	});
