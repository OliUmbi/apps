import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	articleImageInputSchema,
	articleImageKeySchema,
} from "../../../model/content/zelglihof/article-image";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { articleImageStore } from "./article-image.server";

export const listArticleImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ articleId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return articleImageStore().list(data, { article_id: data.articleId });
	});

export const getArticleImage = createServerFn({ method: "GET" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return articleImageStore().get(data);
	});

export const createArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return articleImageStore().create(data);
	});

export const updateArticleImage = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: articleImageKeySchema,
			values: articleImageInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return articleImageStore().update(data.key, data.values);
	});

export const deleteArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await articleImageStore().delete(data);
	});
