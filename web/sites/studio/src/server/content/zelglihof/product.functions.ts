import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import {
	productInputSchema,
	productKeySchema,
} from "@oliumbi/zelglihof-data/content/product";
import { createProductRepository } from "@oliumbi/zelglihof-data/content/product.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listProducts = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductRepository(database.db).list(data);
	});

export const getProduct = createServerFn({ method: "GET" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductRepository(database.db).get(data);
	});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createProductRepository(database.db).create(data);
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: productKeySchema,
			values: productInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		try {
			return await createProductRepository(database.db).update(
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

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createProductRepository(database.db).delete(data);
	});
