import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	reviewInputSchema,
	reviewKeySchema,
} from "../../../model/content/unclet/review";
import { requireActor } from "../../auth.server";
import { reviewStore } from "./review.server";

export const listReviews = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return reviewStore().list(data);
	});

export const getReview = createServerFn({ method: "GET" })
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return reviewStore().get(data);
	});

export const createReview = createServerFn({ method: "POST" })
	.validator(reviewInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return reviewStore().create(data);
	});

export const updateReview = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: reviewKeySchema, values: reviewInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return reviewStore().update(data.key, data.values);
	});

export const deleteReview = createServerFn({ method: "POST" })
	.validator(reviewKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await reviewStore().delete(data);
	});
