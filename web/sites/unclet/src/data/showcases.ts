import { publicImageUrl } from "@oliumbi/assets/urls";
import { pageSchema, slugSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/unclet-data";
import type { Showcase } from "@oliumbi/unclet-data/content/showcase";
import type { ShowcaseImage } from "@oliumbi/unclet-data/content/showcase-image";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
	ContentImage,
	PublicShowcase,
	ShowcaseSummary,
} from "../model/content";
import { database } from "../server/database.server";

function imageFromId(id: string, alt: string): ContentImage {
	return { id, src: publicImageUrl(id), alt };
}

function showcaseSummaryFromRecord(record: Showcase): ShowcaseSummary {
	return {
		id: record.id,
		slug: record.slug,
		title: record.title,
		body: record.body ?? "",
		location: record.location,
		guestCount: record.guestCount,
		image: record.imageId ? imageFromId(record.imageId, record.title) : null,
	};
}

function showcaseFromRecord(
	record: Showcase,
	images: ShowcaseImage[],
): PublicShowcase {
	return {
		...showcaseSummaryFromRecord(record),
		publishedOn: record.publishedOn,
		gallery: images
			.filter((image) => image.imageId !== record.imageId)
			.map((image) => imageFromId(image.imageId, image.description)),
	};
}

export const getShowcasePage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listShowcases(
			data.page,
		);
		return { ...page, items: page.items.map(showcaseSummaryFromRecord) };
	});
export const getShowcase = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(async ({ data }) => {
		const result = await createPublicRepository(database.db).findShowcase(
			data.slug,
		);
		return result ? showcaseFromRecord(result.showcase, result.images) : null;
	});
