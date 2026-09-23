import { idSchema, statusSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { productReservation } from "../schema";

export const productReservationKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductReservationKey = z.infer<typeof productReservationKeySchema>;

export type ProductReservation = typeof productReservation.$inferSelect;

export const productReservationInputSchema = z.strictObject({
	status: statusSchema,
});
export type ProductReservationInput = z.infer<
	typeof productReservationInputSchema
>;

export function newProductReservationInput(): ProductReservationInput {
	return {
		status: "new",
	};
}

export function productReservationInputFromRecord(
	record: ProductReservation,
): ProductReservationInput {
	return {
		status: record.status,
	};
}
