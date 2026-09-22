import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	showcaseImageInputSchema,
	showcaseImageKeySchema,
} from "../../../model/content/unclet/showcase-image";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { showcaseImageStore } from "./showcase-image.server";

export const listShowcaseImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ showcaseId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return showcaseImageStore().list(data, { showcase_id: data.showcaseId });
	});

export const getShowcaseImage = createServerFn({ method: "GET" })
	.validator(showcaseImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return showcaseImageStore().get(data);
	});

export const createShowcaseImage = createServerFn({ method: "POST" })
	.validator(showcaseImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.imageId) await assets.images.get("unclet", data.imageId);
		return showcaseImageStore().create(data);
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
		return showcaseImageStore().update(data.key, data.values);
	});

export const deleteShowcaseImage = createServerFn({ method: "POST" })
	.validator(showcaseImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await showcaseImageStore().delete(data);
	});
