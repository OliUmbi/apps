import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	promotionInputSchema,
	promotionKeySchema,
} from "@oliumbi/jublawoma-data/content/promotion";
import { createPromotionRepository } from "@oliumbi/jublawoma-data/content/promotion.repository";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listPromotions = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createPromotionRepository(database.db).list(data);
	});

export const getPromotion = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		return createPromotionRepository(database.db).get(data);
	});

export const createPromotion = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(promotionInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createPromotionRepository(database.db).create(data);
	});

export const updatePromotion = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: promotionKeySchema,
			values: promotionInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		try {
			return await createPromotionRepository(database.db).update(
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

export const deletePromotion = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await createPromotionRepository(database.db).delete(data);
	});
