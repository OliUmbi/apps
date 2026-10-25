import { bodySchema, idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const reviewKeySchema = z.strictObject({
	id: idSchema,
});
export type ReviewKey = z.infer<typeof reviewKeySchema>;

// The managed review record as it crosses the package boundary. Written out on
// purpose: a renamed storage column must not silently change this shape.
export interface Review {
	id: string;
	stars: number;
	name: string;
	description: string;
	visible: boolean;
	createdAt: string;
	updatedAt: string;
}

export const reviewInputSchema = z.strictObject({
	stars: z.number().int().min(1).max(5),
	name: titleSchema,
	description: bodySchema,
	visible: z.boolean(),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export function newReviewInput(): ReviewInput {
	return {
		stars: 5,
		name: "",
		description: "",
		visible: false,
	};
}

export function reviewInputFromRecord(record: Review): ReviewInput {
	return {
		stars: record.stars,
		name: record.name,
		description: record.description,
		visible: record.visible,
	};
}
