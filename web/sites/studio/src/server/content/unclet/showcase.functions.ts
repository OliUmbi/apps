import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	showcaseInputSchema,
	showcaseKeySchema,
} from "../../../model/content/unclet/showcase";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { showcaseStore } from "./showcase.server";

export const listShowcases = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return showcaseStore().list(data);
	});

export const getShowcase = createServerFn({ method: "GET" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return showcaseStore().get(data);
	});

export const createShowcase = createServerFn({ method: "POST" })
	.validator(showcaseInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.imageId) await assets.images.get("unclet", data.imageId);
		return showcaseStore().create(data);
	});

export const updateShowcase = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: showcaseKeySchema, values: showcaseInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.values.imageId)
			await assets.images.get("unclet", data.values.imageId);
		return showcaseStore().update(data.key, data.values);
	});

export const deleteShowcase = createServerFn({ method: "POST" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await showcaseStore().delete(data);
	});
