import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	bodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const reviewKeySchema = z.strictObject({
	id: idSchema,
});
export type ReviewKey = z.infer<typeof reviewKeySchema>;

export const reviewSchema = z.object({
	id: idSchema,
	stars: z.number().int().min(1).max(5),
	name: z.string(),
	description: z.string(),
	visible: z.boolean(),
	...auditColumns,
});
export type Review = z.infer<typeof reviewSchema>;

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
