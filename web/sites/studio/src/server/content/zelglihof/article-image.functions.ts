import { idSchema, pageSchema } from "@oliumbi/contracts";
import { timestampSchema } from "@oliumbi/contracts/content-validation";
import {
	articleImageInputSchema,
	articleImageKeySchema,
} from "@oliumbi/zelglihof-data/content/article-image";
import { createArticleImageRepository } from "@oliumbi/zelglihof-data/content/article-image.repository";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listArticleImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ articleId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleImageRepository(database.db).listForArticle(
			data,
			data.articleId,
		);
	});

export const getArticleImage = createServerFn({ method: "GET" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleImageRepository(database.db).get(data);
	});

export const createArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createArticleImageRepository(database.db).create(data);
	});

export const updateArticleImage = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: articleImageKeySchema,
			values: articleImageInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		try {
			return await createArticleImageRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw error;
		}
	});

export const deleteArticleImage = createServerFn({ method: "POST" })
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createArticleImageRepository(database.db).delete(data);
	});
