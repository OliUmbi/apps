import { idSchema, pageSchema } from "@oliumbi/contracts";
import {
	productVariantInputSchema,
	productVariantKeySchema,
} from "@oliumbi/zelglihof-data/content/product-variant";
import { createProductVariantRepository } from "@oliumbi/zelglihof-data/content/product-variant.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listProductVariants = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ productId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductVariantRepository(database.db).listForProduct(
			data,
			data.productId,
		);
	});

export const getProductVariant = createServerFn({ method: "GET" })
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductVariantRepository(database.db).get(data);
	});

export const createProductVariant = createServerFn({ method: "POST" })
	.validator(productVariantInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createProductVariantRepository(database.db).create(data);
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
		return createProductVariantRepository(database.db).update(
			data.key,
			data.values,
		);
	});

export const deleteProductVariant = createServerFn({ method: "POST" })
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createProductVariantRepository(database.db).delete(data);
	});
