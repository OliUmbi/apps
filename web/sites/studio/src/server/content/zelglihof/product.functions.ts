import { pageSchema } from "@oliumbi/contracts";
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
		return createProductRepository(database.sql).list(data);
	});

export const getProduct = createServerFn({ method: "GET" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductRepository(database.sql).get(data);
	});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createProductRepository(database.sql).create(data);
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: productKeySchema, values: productInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return createProductRepository(database.sql).update(data.key, data.values);
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createProductRepository(database.sql).delete(data);
	});
