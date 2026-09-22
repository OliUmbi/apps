import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const storyImageKeySchema = z.strictObject({
	storyId: idSchema,
	imageId: idSchema,
});
export type StoryImageKey = z.infer<typeof storyImageKeySchema>;

export const storyImageSchema = z.object({
	storyId: idSchema,
	imageId: idSchema,
	description: z.string(),
	...auditColumns,
});
export type StoryImage = z.infer<typeof storyImageSchema>;

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
