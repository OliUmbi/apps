import { pageSchema } from "@oliumbi/contracts";
import {
	articleInputSchema,
	articleKeySchema,
} from "@oliumbi/zelglihof-data/content/article";
import { createArticleRepository } from "@oliumbi/zelglihof-data/content/article.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listArticles = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleRepository(database.db).list(data);
	});

export const getArticle = createServerFn({ method: "GET" })
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createArticleRepository(database.db).get(data);
	});

export const createArticle = createServerFn({ method: "POST" })
	.validator(articleInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createArticleRepository(database.db).create(data);
	});

export const updateArticle = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: articleKeySchema, values: articleInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return createArticleRepository(database.db).update(data.key, data.values);
	});

export const deleteArticle = createServerFn({ method: "POST" })
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createArticleRepository(database.db).delete(data);
	});
