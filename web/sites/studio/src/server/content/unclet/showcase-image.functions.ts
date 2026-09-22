import { idSchema, pageSchema } from "@oliumbi/contracts";
import {
	showcaseImageInputSchema,
	showcaseImageKeySchema,
} from "@oliumbi/unclet-data/content/showcase-image";
import { createShowcaseImageRepository } from "@oliumbi/unclet-data/content/showcase-image.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listShowcaseImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ showcaseId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createShowcaseImageRepository(database.sql).listForShowcase(
			data,
			data.showcaseId,
		);
	});

export const getShowcaseImage = createServerFn({ method: "GET" })
	.validator(showcaseImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createShowcaseImageRepository(database.sql).get(data);
	});

export const createShowcaseImage = createServerFn({ method: "POST" })
	.validator(showcaseImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.imageId) await assets.images.get("unclet", data.imageId);
		return createShowcaseImageRepository(database.sql).create(data);
	});

export const updateShowcaseImage = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: showcaseImageKeySchema,
			values: showcaseImageInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.values.imageId)
			await assets.images.get("unclet", data.values.imageId);
		return createShowcaseImageRepository(database.sql).update(
			data.key,
			data.values,
		);
	});

export const deleteShowcaseImage = createServerFn({ method: "POST" })
	.validator(showcaseImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await createShowcaseImageRepository(database.sql).delete(data);
	});
