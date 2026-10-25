import { z } from "zod";
import { imageVariantSizes } from "./sizes";

export const imageSchema = z.object({
	id: z.uuid(),
	site: z.string(),
	visible: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export const documentSchema = imageSchema.extend({
	slug: z.string(),
	filename: z.string(),
	bytes: z.number(),
	checksum: z.string(),
});
const variantSchema = z.object({
	size: z.enum(imageVariantSizes),
	contentType: z.string(),
	width: z.number(),
	height: z.number(),
	bytes: z.number(),
	checksum: z.string(),
});
export const imageDetailSchema = z.object({
	image: imageSchema,
	variants: z.array(variantSchema),
});
