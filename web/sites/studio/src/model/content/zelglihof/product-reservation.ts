import { idSchema, statusSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	optionalBodySchema,
	optionalTextSchema,
	titleSchema,
} from "../validation";

export const productReservationKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductReservationKey = z.infer<typeof productReservationKeySchema>;

export const productReservationSchema = z.object({
	id: idSchema,
	productId: idSchema.nullable(),
	productVariantId: idSchema.nullable(),
	productName: titleSchema,
	variantName: titleSchema,
	variantDescription: optionalTextSchema,
	variantQuantity: z.number().int().nonnegative().nullable(),
	variantPrice: titleSchema,
	name: titleSchema,
	phone: z.string(),
	email: z.string().nullable(),
	quantity: z.number().int().nonnegative(),
	note: optionalBodySchema,
	status: statusSchema,
	...auditColumns,
});
export type ProductReservation = z.infer<typeof productReservationSchema>;

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
