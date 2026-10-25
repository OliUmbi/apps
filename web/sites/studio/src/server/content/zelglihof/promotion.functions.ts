import { pageSchema } from "@oliumbi/contracts";
import { timestampSchema } from "@oliumbi/contracts/content-validation";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import {
	promotionInputSchema,
	promotionKeySchema,
} from "@oliumbi/zelglihof-data/content/promotion";
import { createPromotionRepository } from "@oliumbi/zelglihof-data/content/promotion.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listPromotions = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createPromotionRepository(database.db).list(data);
	});

export const getPromotion = createServerFn({ method: "GET" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createPromotionRepository(database.db).get(data);
	});

export const createPromotion = createServerFn({ method: "POST" })
	.validator(promotionInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createPromotionRepository(database.db).create(data);
	});

export const updatePromotion = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: promotionKeySchema,
			values: promotionInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		try {
			return await createPromotionRepository(database.db).update(
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

export const deletePromotion = createServerFn({ method: "POST" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createPromotionRepository(database.db).delete(data);
	});
