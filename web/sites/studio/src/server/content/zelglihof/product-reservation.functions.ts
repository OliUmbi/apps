import { idSchema, pageSchema } from "@oliumbi/contracts";
import {
	productReservationInputSchema,
	productReservationKeySchema,
} from "@oliumbi/zelglihof-data/content/product-reservation";
import { createProductReservationRepository } from "@oliumbi/zelglihof-data/content/product-reservation.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listProductReservations = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ productId: idSchema.optional() }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		const repository = createProductReservationRepository(database.sql);
		return data.productId
			? repository.listForProduct(data, data.productId)
			: repository.list(data);
	});

export const getProductReservation = createServerFn({ method: "GET" })
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductReservationRepository(database.sql).get(data);
	});

export const updateProductReservation = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: productReservationKeySchema,
			values: productReservationInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createProductReservationRepository(database.sql).update(
			data.key,
			data.values,
		);
	});

export const deleteProductReservation = createServerFn({ method: "POST" })
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createProductReservationRepository(database.sql).delete(data);
	});
