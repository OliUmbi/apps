import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	productVariantInputSchema,
	productVariantKeySchema,
} from "../../../model/content/zelglihof/product-variant";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { productVariantStore } from "./product-variant.server";

export const listProductVariants = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ productId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productVariantStore().list(data, { product_id: data.productId });
	});

export const getProductVariant = createServerFn({ method: "GET" })
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productVariantStore().get(data);
	});

export const createProductVariant = createServerFn({ method: "POST" })
	.validator(productVariantInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return productVariantStore().create(data);
	});

export const updateProductVariant = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: productVariantKeySchema,
			values: productVariantInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return productVariantStore().update(data.key, data.values);
	});

export const deleteProductVariant = createServerFn({ method: "POST" })
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await productVariantStore().delete(data);
	});
