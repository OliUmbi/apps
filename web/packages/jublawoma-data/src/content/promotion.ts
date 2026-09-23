import { idSchema, linkSchema } from "@oliumbi/contracts";
import {
	bodySchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { promotion } from "../schema";

export const promotionKeySchema = z.strictObject({
	id: idSchema,
});
export type PromotionKey = z.infer<typeof promotionKeySchema>;

export type Promotion = typeof promotion.$inferSelect;

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
