import { pageSchema } from "@oliumbi/contracts";
import {
	showcaseInputSchema,
	showcaseKeySchema,
} from "@oliumbi/unclet-data/content/showcase";
import { createShowcaseRepository } from "@oliumbi/unclet-data/content/showcase.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listShowcases = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createShowcaseRepository(database.sql).list(data);
	});

export const getShowcase = createServerFn({ method: "GET" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createShowcaseRepository(database.sql).get(data);
	});

export const createShowcase = createServerFn({ method: "POST" })
	.validator(showcaseInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.imageId) await assets.images.get("unclet", data.imageId);
		return createShowcaseRepository(database.sql).create(data);
	});

export const updateShowcase = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: showcaseKeySchema, values: showcaseInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.values.imageId)
			await assets.images.get("unclet", data.values.imageId);
		return createShowcaseRepository(database.sql).update(data.key, data.values);
	});

export const deleteShowcase = createServerFn({ method: "POST" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await createShowcaseRepository(database.sql).delete(data);
	});
