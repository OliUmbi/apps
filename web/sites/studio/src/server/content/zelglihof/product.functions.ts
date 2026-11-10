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
import { recordAudit } from "../../audit.server";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listProducts = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createProductRepository(database.db).list(data);
	});

export const getProduct = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		return createProductRepository(database.db).get(data);
	});

export const createProduct = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(productInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("zelglihof", data.imageId);
		return createProductRepository(database.db).create(data);
	});

export const updateProduct = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: productKeySchema,
			values: productInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
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

export const archiveProduct = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: productKeySchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		try {
			const record = await createProductRepository(database.db).archive(
				data.key,
				data.updatedAt,
				context.actor.name,
			);
			await recordAudit(context.actor, {
				site: "zelglihof",
				action: "product.archive",
				entity: "product",
				entityId: data.key.id,
			});
			return record;
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(productKeySchema)
	.handler(async ({ data }) => {
		await createProductRepository(database.db).delete(data);
	});
