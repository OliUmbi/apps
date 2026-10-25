import { idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const showcaseImageKeySchema = z.strictObject({
	showcaseId: idSchema,
	imageId: idSchema,
});
export type ShowcaseImageKey = z.infer<typeof showcaseImageKeySchema>;

// The managed showcase image record as it crosses the package boundary.
// Written out on purpose: a renamed storage column must not silently change
// this shape.
export interface ShowcaseImage {
	showcaseId: string;
	imageId: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

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
