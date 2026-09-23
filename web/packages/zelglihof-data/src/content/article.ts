import { idSchema, slugSchema } from "@oliumbi/contracts";
import {
	bodySchema,
	dateSchema,
	publicationIsValid,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { article } from "../schema";

export const articleKeySchema = z.strictObject({
	id: idSchema,
});
export type ArticleKey = z.infer<typeof articleKeySchema>;

export type Article = typeof article.$inferSelect;

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
