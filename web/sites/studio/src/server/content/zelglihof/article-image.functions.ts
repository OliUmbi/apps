import { idSchema, pageSchema } from "@oliumbi/contracts";
import {
	articleImageInputSchema,
	articleImageKeySchema,
} from "@oliumbi/zelglihof-data/content/article-image";
import { createArticleImageRepository } from "@oliumbi/zelglihof-data/content/article-image.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listArticleImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ articleId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleImageRepository(database.sql).listForArticle(
			data,
			data.articleId,
		);
	});

export const getArticleImage = createServerFn({ method: "GET" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleImageRepository(database.sql).get(data);
	});

export const createArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createArticleImageRepository(database.sql).create(data);
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
		return createArticleImageRepository(database.sql).update(
			data.key,
			data.values,
		);
	});

export const deleteArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createArticleImageRepository(database.sql).delete(data);
	});
