import {
	idSchema,
	pageSchema,
	timestampSchema,
	toAppError,
} from "@oliumbi/contracts";
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
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listArticleImages = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema.extend({ articleId: idSchema }))
	.handler(async ({ data }) => {
		return createArticleImageRepository(database.db).listForArticle(
			data,
			data.articleId,
		);
	});

export const getArticleImage = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		return createArticleImageRepository(database.db).get(data);
	});

export const createArticleImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(articleImageInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createArticleImageRepository(database.db).create(data);
	});

export const updateArticleImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: articleImageKeySchema,
			values: articleImageInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
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
			throw toAppError(error);
		}
	});

export const deleteArticleImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(articleImageKeySchema)
	.handler(async ({ data }) => {
		await createArticleImageRepository(database.db).delete(data);
	});
