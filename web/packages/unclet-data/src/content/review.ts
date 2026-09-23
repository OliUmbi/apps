import { idSchema } from "@oliumbi/contracts";
import { bodySchema, titleSchema } from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { review } from "../schema";

export const reviewKeySchema = z.strictObject({
	id: idSchema,
});
export type ReviewKey = z.infer<typeof reviewKeySchema>;

export type Review = typeof review.$inferSelect;

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
