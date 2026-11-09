import {
	idSchema,
	pageSchema,
	timestampSchema,
	toAppError,
} from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import {
	productVariantInputSchema,
	productVariantKeySchema,
} from "@oliumbi/zelglihof-data/content/product-variant";
import { createProductVariantRepository } from "@oliumbi/zelglihof-data/content/product-variant.repository";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listProductVariants = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema.extend({ productId: idSchema }))
	.handler(async ({ data }) => {
		return createProductVariantRepository(database.db).listForProduct(
			data,
			data.productId,
		);
	});

export const getProductVariant = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		return createProductVariantRepository(database.db).get(data);
	});

export const createProductVariant = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(productVariantInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createProductVariantRepository(database.db).create(data);
	});

export const updateProductVariant = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: productVariantKeySchema,
			values: productVariantInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		try {
			return await createProductVariantRepository(database.db).update(
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

export const deleteProductVariant = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(productVariantKeySchema)
	.handler(async ({ data }) => {
		await createProductVariantRepository(database.db).delete(data);
	});
