import { pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/unclet-data";
import { reviewSchema } from "@oliumbi/unclet-data/contracts";
import { createReviewRepository } from "@oliumbi/unclet-data/review.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PublicReview } from "../model/content";
import { database } from "../server/database.server";

export { type ReviewInput, reviewSchema } from "@oliumbi/unclet-data/contracts";

export const sendReview = createServerFn({ method: "POST" })
	.validator(reviewSchema)
	.handler(async ({ data }) => {
		await createReviewRepository(database.db).submit(data);
		return { outcome: "accepted" as const };
	});

export const getReviewPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listReviews(
			data.page,
		);
		return {
			...page,
			items: page.items.map(
				(record): PublicReview => ({
					id: record.id,
					name: record.name,
					description: record.description,
					stars: record.stars,
				}),
			),
		};
	});
