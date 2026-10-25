import { idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const storyImageKeySchema = z.strictObject({
	storyId: idSchema,
	imageId: idSchema,
});
export type StoryImageKey = z.infer<typeof storyImageKeySchema>;

// The managed story image record as it crosses the package boundary. Written
// out on purpose: a renamed storage column must not silently change this shape.
export interface StoryImage {
	storyId: string;
	imageId: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export const storyImageInputSchema = z.strictObject({
	storyId: idSchema,
	imageId: idSchema,
	description: titleSchema,
});
export type StoryImageInput = z.infer<typeof storyImageInputSchema>;

export function newStoryImageInput(storyId: string): StoryImageInput {
	return {
		storyId: storyId,
		imageId: "",
		description: "",
	};
}

export function storyImageInputFromRecord(record: StoryImage): StoryImageInput {
	return {
		storyId: record.storyId,
		imageId: record.imageId,
		description: record.description,
	};
}
