import {
	bodySchema,
	dateSchema,
	idSchema,
	publicationIsValid,
	slugSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const storyKeySchema = z.strictObject({
	id: idSchema,
});
export type StoryKey = z.infer<typeof storyKeySchema>;

// The managed story record as it crosses the package boundary. Written out on
// purpose: a renamed storage column must not silently change this shape.
export interface Story {
	id: string;
	slug: string;
	title: string;
	description: string;
	author: string;
	imageId: string | null;
	body: string;
	published: boolean;
	publishedOn: string | null;
	createdAt: string;
	updatedAt: string;
}

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
