import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	productReservationInputSchema,
	productReservationKeySchema,
} from "../../../model/content/zelglihof/product-reservation";
import { requireActor } from "../../auth.server";
import { productReservationStore } from "./product-reservation.server";

export const listProductReservations = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ productId: idSchema.optional() }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productReservationStore().list(
			data,
			data.productId ? { product_id: data.productId } : {},
		);
	});

export const getProductReservation = createServerFn({ method: "GET" })
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return productReservationStore().get(data);
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
		return productReservationStore().update(data.key, data.values);
	});

export const deleteProductReservation = createServerFn({ method: "POST" })
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await productReservationStore().delete(data);
	});
