import { idSchema } from "@oliumbi/contracts";
import { titleSchema } from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { articleImage } from "../schema";

export const articleImageKeySchema = z.strictObject({
	articleId: idSchema,
	imageId: idSchema,
});
export type ArticleImageKey = z.infer<typeof articleImageKeySchema>;

export type ArticleImage = typeof articleImage.$inferSelect;

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
