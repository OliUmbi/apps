import {
	bodySchema,
	dateSchema,
	idSchema,
	publicationIsValid,
	slugSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const articleKeySchema = z.strictObject({
	id: idSchema,
});
export type ArticleKey = z.infer<typeof articleKeySchema>;

// The managed article record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Article {
	id: string;
	slug: string;
	title: string;
	description: string;
	imageId: string | null;
	body: string;
	published: boolean;
	publishedOn: string | null;
	createdAt: string;
	updatedAt: string;
}

export const articleInputSchema = z
	.strictObject({
		slug: slugSchema,
		title: titleSchema,
		description: bodySchema,
		imageId: idSchema.nullable(),
		body: bodySchema,
		published: z.boolean(),
		publishedOn: dateSchema.nullable(),
	})
	.refine(publicationIsValid, {
		path: ["publishedOn"],
		message: "A publication date is required",
	});
export type ArticleInput = z.infer<typeof articleInputSchema>;

export function newArticleInput(): ArticleInput {
	return {
		slug: "",
		title: "",
		description: "",
		imageId: null,
		body: "",
		published: false,
		publishedOn: null,
	};
}

export function articleInputFromRecord(record: Article): ArticleInput {
	return {
		slug: record.slug,
		title: record.title,
		description: record.description,
		imageId: record.imageId,
		body: record.body,
		published: record.published,
		publishedOn: record.publishedOn,
	};
}
