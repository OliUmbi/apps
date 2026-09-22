import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	articleInputSchema,
	articleKeySchema,
} from "../../../model/content/zelglihof/article";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { articleStore } from "./article.server";

export const listArticles = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return articleStore().list(data);
	});

export const getArticle = createServerFn({ method: "GET" })
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return articleStore().get(data);
	});

export const createArticle = createServerFn({ method: "POST" })
	.validator(articleInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return articleStore().create(data);
	});

export const updateArticle = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: articleKeySchema, values: articleInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return articleStore().update(data.key, data.values);
	});

export const deleteArticle = createServerFn({ method: "POST" })
	.validator(articleKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await articleStore().delete(data);
	});
