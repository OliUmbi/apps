import { idSchema, slugSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	bodySchema,
	databaseDateSchema,
	dateSchema,
	publicationIsValid,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const storyKeySchema = z.strictObject({
	id: idSchema,
});
export type StoryKey = z.infer<typeof storyKeySchema>;

export const storySchema = z.object({
	id: idSchema,
	slug: slugSchema,
	title: z.string(),
	description: z.string(),
	author: z.string(),
	imageId: idSchema.nullable(),
	body: z.string(),
	published: z.boolean(),
	publishedOn: databaseDateSchema.nullable(),
	...auditColumns,
});
export type Story = z.infer<typeof storySchema>;

export const storyInputSchema = z
	.strictObject({
		slug: slugSchema,
		title: titleSchema,
		description: bodySchema,
		author: titleSchema,
		imageId: idSchema.nullable(),
		body: bodySchema,
		published: z.boolean(),
		publishedOn: dateSchema.nullable(),
	})
	.refine(publicationIsValid, {
		path: ["publishedOn"],
		message: "A publication date is required",
	});
export type StoryInput = z.infer<typeof storyInputSchema>;

export function newStoryInput(): StoryInput {
	return {
		slug: "",
		title: "",
		description: "",
		author: "",
		imageId: null,
		body: "",
		published: false,
		publishedOn: null,
	};
}

export function storyInputFromRecord(record: Story): StoryInput {
	return {
		slug: record.slug,
		title: record.title,
		description: record.description,
		author: record.author,
		imageId: record.imageId,
		body: record.body,
		published: record.published,
		publishedOn: record.publishedOn,
	};
}
