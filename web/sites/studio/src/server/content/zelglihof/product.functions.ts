import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	productInputSchema,
	productKeySchema,
} from "../../../model/content/zelglihof/product";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { productStore } from "./product.server";

export const listProducts = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productStore().list(data);
	});

export const getProduct = createServerFn({ method: "GET" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productStore().get(data);
	});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return productStore().create(data);
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: productKeySchema, values: productInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		if (data.values.imageId)
			await assets.images.get("zelglihof", data.values.imageId);
		return productStore().update(data.key, data.values);
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await productStore().delete(data);
	});
