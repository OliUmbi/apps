import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/unclet-data/content/errors";
import {
	reviewInputSchema,
	reviewKeySchema,
} from "@oliumbi/unclet-data/content/review";
import { createReviewRepository } from "@oliumbi/unclet-data/content/review.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listReviews = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("unclet")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createReviewRepository(database.db).list(data);
	});

export const getReview = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("unclet")])
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		return createReviewRepository(database.db).get(data);
	});

export const createReview = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("unclet")])
	.validator(reviewInputSchema)
	.handler(async ({ data }) => {
		return createReviewRepository(database.db).create(data);
	});

export const updateReview = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("unclet")])
	.validator(
		z.strictObject({
			key: reviewKeySchema,
			values: reviewInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await createReviewRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteReview = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("unclet")])
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		await createReviewRepository(database.db).delete(data);
	});
