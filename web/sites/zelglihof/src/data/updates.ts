import { publicImageUrl } from "@oliumbi/assets/urls";
import { pageSchema, slugSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import type { Article } from "@oliumbi/zelglihof-data/content/article";
import type { ArticleImage } from "@oliumbi/zelglihof-data/content/article-image";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Update, UpdateSummary } from "../model/content";
import { database } from "../server/database.server";

function updateSummaryFromRecord(record: Article): UpdateSummary {
	return {
		id: record.id,
		slug: record.slug,
		title: record.title,
		description: record.description,
		image: record.imageId ? publicImageUrl(record.imageId) : "",
		date: record.publishedOn ?? "",
		category: "Vom Hof",
	};
}

function updateFromRecord(record: Article, images: ArticleImage[]): Update {
	return {
		...updateSummaryFromRecord(record),
		body: record.body,
		images: images.map((image) => ({
			id: image.imageId,
			src: publicImageUrl(image.imageId),
			description: image.description,
		})),
	};
}
export const getUpdatePage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listArticles(
			data.page,
		);
		return {
			...page,
			items: page.items.map(updateSummaryFromRecord),
		};
	});
export const getUpdate = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(async ({ data }) => {
		const result = await createPublicRepository(database.db).findArticle(
			data.slug,
		);
		return result ? updateFromRecord(result.article, result.images) : null;
	});
