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
	productReservationInputSchema,
	productReservationKeySchema,
} from "@oliumbi/zelglihof-data/content/product-reservation";
import { createProductReservationRepository } from "@oliumbi/zelglihof-data/content/product-reservation.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listProductReservations = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema.extend({ productId: idSchema.optional() }))
	.handler(async ({ data }) => {
		const repository = createProductReservationRepository(database.db);
		return data.productId
			? repository.listForProduct(data, data.productId)
			: repository.list(data);
	});

export const getProductReservation = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		return createProductReservationRepository(database.db).get(data);
	});

export const updateProductReservation = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: productReservationKeySchema,
			values: productReservationInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await createProductReservationRepository(database.db).update(
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

export const cancelProductReservation = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: productReservationKeySchema,
			reason: z.string().trim().max(500).nullable().optional(),
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		try {
			// One transaction holds the reservation and variant row locks: stock is
			// restored and the cancellation metadata is written atomically.
			return await database.transaction((transaction) =>
				createProductReservationRepository(transaction).cancel(
					data.key,
					data.updatedAt,
					context.actor.name,
					data.reason ?? null,
				),
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteProductReservation = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(productReservationKeySchema)
	.handler(async ({ data }) => {
		await createProductReservationRepository(database.db).delete(data);
	});
