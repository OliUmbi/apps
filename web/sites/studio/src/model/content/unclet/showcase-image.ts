import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { auditColumns, titleSchema } from "../validation";

export const showcaseImageKeySchema = z.strictObject({
	showcaseId: idSchema,
	imageId: idSchema,
});
export type ShowcaseImageKey = z.infer<typeof showcaseImageKeySchema>;

export const showcaseImageSchema = z.object({
	showcaseId: idSchema,
	imageId: idSchema,
	description: titleSchema,
	...auditColumns,
});
export type ShowcaseImage = z.infer<typeof showcaseImageSchema>;

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
