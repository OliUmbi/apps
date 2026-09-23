import { idSchema } from "@oliumbi/contracts";
import { titleSchema } from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { showcaseImage } from "../schema";

export const showcaseImageKeySchema = z.strictObject({
	showcaseId: idSchema,
	imageId: idSchema,
});
export type ShowcaseImageKey = z.infer<typeof showcaseImageKeySchema>;

export type ShowcaseImage = typeof showcaseImage.$inferSelect;

export const showcaseImageInputSchema = z.strictObject({
	showcaseId: idSchema,
	imageId: idSchema,
	description: titleSchema,
});
export type ShowcaseImageInput = z.infer<typeof showcaseImageInputSchema>;

export function newShowcaseImageInput(showcaseId: string): ShowcaseImageInput {
	return {
		showcaseId: showcaseId,
		imageId: "",
		description: "",
	};
}

export function showcaseImageInputFromRecord(
	record: ShowcaseImage,
): ShowcaseImageInput {
	return {
		showcaseId: record.showcaseId,
		imageId: record.imageId,
		description: record.description,
	};
}
