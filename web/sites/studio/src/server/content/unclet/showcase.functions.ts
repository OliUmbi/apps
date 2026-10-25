import { pageSchema, timestampSchema } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/unclet-data/content/errors";
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
		return createShowcaseRepository(database.db).list(data);
	});

export const getShowcase = createServerFn({ method: "GET" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return createShowcaseRepository(database.db).get(data);
	});

export const createShowcase = createServerFn({ method: "POST" })
	.validator(showcaseInputSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.imageId) await assets.images.get("unclet", data.imageId);
		return createShowcaseRepository(database.db).create(data);
	});

export const updateShowcase = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: showcaseKeySchema,
			values: showcaseInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		if (data.values.imageId)
			await assets.images.get("unclet", data.values.imageId);
		try {
			return await createShowcaseRepository(database.db).update(
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

export const deleteShowcase = createServerFn({ method: "POST" })
	.validator(showcaseKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await createShowcaseRepository(database.db).delete(data);
	});
