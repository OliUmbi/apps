import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { type ReservationStatus, reservationStatusSchema } from "../statuses";

export const productReservationKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductReservationKey = z.infer<typeof productReservationKeySchema>;

// The managed product reservation record as it crosses the package boundary.
// Written out on purpose: a renamed storage column must not silently change
// this shape. The nullable parent references keep orphaned reservations
// visible (database/README.md).
export interface ProductReservation {
	id: string;
	productId: string | null;
	productVariantId: string | null;
	productName: string;
	variantName: string;
	variantDescription: string | null;
	variantQuantity: number | null;
	variantPrice: string;
	name: string;
	phone: string;
	email: string | null;
	quantity: number;
	note: string | null;
	status: ReservationStatus;
	cancelledAt: string | null;
	cancelledBy: string | null;
	cancellationReason: string | null;
	stockRestored: boolean;
	submissionId: string | null;
	createdAt: string;
	updatedAt: string;
}

export const productReservationInputSchema = z.strictObject({
	status: reservationStatusSchema,
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

// Cancellation is an explicit transition: only open work can be cancelled, and
// stock is restored only when the reservation was created against a tracked
// variant that still exists with tracked stock. A missing or unlimited variant
// cancels without a stock change (the reservation records that fact).
export type ReservationCancellationPlan =
	| { allowed: true; restoreStock: boolean }
	| { allowed: false };

export function decideReservationCancellation(input: {
	status: ReservationStatus;
	variantQuantity: number | null;
	variantExists: boolean;
	variantCurrentQuantity: number | null;
}): ReservationCancellationPlan {
	if (input.status !== "new" && input.status !== "in-progress")
		return { allowed: false };
	return {
		allowed: true,
		restoreStock:
			input.variantQuantity !== null &&
			input.variantExists &&
			input.variantCurrentQuantity !== null,
	};
}
