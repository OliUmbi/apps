import { idSchema, statusSchema } from "@oliumbi/contracts";
import { auditColumns } from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const productReservationKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductReservationKey = z.infer<typeof productReservationKeySchema>;

export const productReservationSchema = z.object({
	id: idSchema,
	productId: idSchema.nullable(),
	productVariantId: idSchema.nullable(),
	productName: z.string(),
	variantName: z.string(),
	variantDescription: z.string().nullable(),
	variantQuantity: z.number().int().nonnegative().nullable(),
	variantPrice: z.string(),
	name: z.string(),
	phone: z.string(),
	email: z.string().nullable(),
	quantity: z.number().int().nonnegative(),
	note: z.string().nullable(),
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
