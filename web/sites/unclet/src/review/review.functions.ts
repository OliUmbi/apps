import { createServerFn } from "@tanstack/react-start";
import { reviewSchema } from "./review.schema";
import { saveReview } from "./review.server";

export const sendReview = createServerFn({ method: "POST" })
	.validator(reviewSchema)
	.handler(({ data }) => saveReview(data));
