import {
	bodySchema,
	idSchema,
	linkSchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const promotionKeySchema = z.strictObject({
	id: idSchema,
});
export type PromotionKey = z.infer<typeof promotionKeySchema>;

// The managed promotion record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Promotion {
	id: string;
	title: string;
	description: string;
	link: string;
	imageId: string | null;
	startsAt: string;
	endsAt: string;
	createdAt: string;
	updatedAt: string;
}

export const promotionInputSchema = z
	.strictObject({
		title: titleSchema,
		description: bodySchema,
		link: linkSchema,
		imageId: idSchema.nullable(),
		startsAt: timestampSchema,
		endsAt: timestampSchema,
	})
	.refine(timestampRangeIsValid, {
		path: ["endsAt"],
		message: "End must follow start",
	});
export type PromotionInput = z.infer<typeof promotionInputSchema>;

export function newPromotionInput(): PromotionInput {
	return {
		title: "",
		description: "",
		link: "",
		imageId: null,
		startsAt: "",
		endsAt: "",
	};
}

export function promotionInputFromRecord(record: Promotion): PromotionInput {
	return {
		title: record.title,
		description: record.description,
		link: record.link,
		imageId: record.imageId,
		startsAt: record.startsAt,
		endsAt: record.endsAt,
	};
}
