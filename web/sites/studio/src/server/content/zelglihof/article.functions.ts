import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	articleInputSchema,
	articleKeySchema,
} from "@oliumbi/zelglihof-data/content/article";
import { createArticleRepository } from "@oliumbi/zelglihof-data/content/article.repository";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listArticles = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createArticleRepository(database.db).list(data);
	});

export const getArticle = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		return createArticleRepository(database.db).get(data);
	});

export const createArticle = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(articleInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createArticleRepository(database.db).create(data);
	});

export const updateArticle = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: articleKeySchema,
			values: articleInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		try {
			return await createArticleRepository(database.db).update(
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

export const deleteArticle = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		await createArticleRepository(database.db).delete(data);
	});
