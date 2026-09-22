import { pageSchema } from "@oliumbi/contracts";
import {
	promotionInputSchema,
	promotionKeySchema,
} from "@oliumbi/jublawoma-data/content/promotion";
import { createPromotionRepository } from "@oliumbi/jublawoma-data/content/promotion.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listPromotions = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createPromotionRepository(database.sql).list(data);
	});

export const getPromotion = createServerFn({ method: "GET" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createPromotionRepository(database.sql).get(data);
	});

export const createPromotion = createServerFn({ method: "POST" })
	.validator(promotionInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createPromotionRepository(database.sql).create(data);
	});

export const updatePromotion = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: promotionKeySchema, values: promotionInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return createPromotionRepository(database.sql).update(
			data.key,
			data.values,
		);
	});

export const deletePromotion = createServerFn({ method: "POST" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createPromotionRepository(database.sql).delete(data);
	});
