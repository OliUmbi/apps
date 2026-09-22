import { reviewSchema } from "@oliumbi/unclet-data/contracts";
import { createReviewRepository } from "@oliumbi/unclet-data/review.repository";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export { type ReviewInput, reviewSchema } from "@oliumbi/unclet-data/contracts";

export const sendReview = createServerFn({ method: "POST" })
	.validator(reviewSchema)
	.handler(async ({ data }) => {
		await createReviewRepository(database.sql).submit(data);
		return { outcome: "accepted" as const };
	});
