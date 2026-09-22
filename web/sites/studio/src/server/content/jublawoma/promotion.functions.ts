import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	promotionInputSchema,
	promotionKeySchema,
} from "../../../model/content/jublawoma/promotion";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { promotionStore } from "./promotion.server";

export const listPromotions = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return promotionStore().list(data);
	});

export const getPromotion = createServerFn({ method: "GET" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return promotionStore().get(data);
	});

export const createPromotion = createServerFn({ method: "POST" })
	.validator(promotionInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return promotionStore().create(data);
	});

export const updatePromotion = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: promotionKeySchema, values: promotionInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return promotionStore().update(data.key, data.values);
	});

export const deletePromotion = createServerFn({ method: "POST" })
	.validator(promotionKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await promotionStore().delete(data);
	});
