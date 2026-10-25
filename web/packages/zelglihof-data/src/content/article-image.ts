import { idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const articleImageKeySchema = z.strictObject({
	articleId: idSchema,
	imageId: idSchema,
});
export type ArticleImageKey = z.infer<typeof articleImageKeySchema>;

// The managed article image record as it crosses the package boundary. Written
// out on purpose: a renamed storage column must not silently change this shape.
export interface ArticleImage {
	articleId: string;
	imageId: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export const articleImageInputSchema = z.strictObject({
	articleId: idSchema,
	imageId: idSchema,
	description: titleSchema,
});
export type ArticleImageInput = z.infer<typeof articleImageInputSchema>;

export function newArticleImageInput(articleId: string): ArticleImageInput {
	return {
		articleId: articleId,
		imageId: "",
		description: "",
	};
}

export function articleImageInputFromRecord(
	record: ArticleImage,
): ArticleImageInput {
	return {
		articleId: record.articleId,
		imageId: record.imageId,
		description: record.description,
	};
}
