import { pageSchema } from "@oliumbi/contracts";
import {
	reviewInputSchema,
	reviewKeySchema,
} from "@oliumbi/unclet-data/content/review";
import { createReviewRepository } from "@oliumbi/unclet-data/content/review.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listReviews = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createReviewRepository(database.db).list(data);
	});

export const getReview = createServerFn({ method: "GET" })
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createReviewRepository(database.db).get(data);
	});

export const createReview = createServerFn({ method: "POST" })
	.validator(reviewInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createReviewRepository(database.db).create(data);
	});

export const updateReview = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: reviewKeySchema, values: reviewInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createReviewRepository(database.db).update(data.key, data.values);
	});

export const deleteReview = createServerFn({ method: "POST" })
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await createReviewRepository(database.db).delete(data);
	});
