import { idSchema, optionalTextSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { decimalSchema } from "../forms";

export const donationItemKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationItemKey = z.infer<typeof donationItemKeySchema>;

// The managed donation item record as it crosses the package boundary. Written
// out on purpose: a renamed storage column must not silently change this shape.
// Quantities stay exact decimal strings (D2).
export interface DonationItem {
	id: string;
	donationId: string;
	name: string;
	detail: string | null;
	quantity: string;
	step: string;
	unit: string;
	createdAt: string;
	updatedAt: string;
}

export const donationItemInputSchema = z.strictObject({
	donationId: idSchema,
	name: titleSchema,
	detail: optionalTextSchema,
	// Decimal strings keep quantities exact end to end (D2); the database
	// additionally rejects non-positive quantities and steps.
	quantity: decimalSchema,
	step: decimalSchema,
	unit: titleSchema,
});
export type DonationItemInput = z.infer<typeof donationItemInputSchema>;

export function newDonationItemInput(donationId: string): DonationItemInput {
	return {
		donationId: donationId,
		name: "",
		detail: null,
		quantity: "1",
		step: "0.5",
		unit: "",
	};
}

export function donationItemInputFromRecord(
	record: DonationItem,
): DonationItemInput {
	return {
		donationId: record.donationId,
		name: record.name,
		detail: record.detail,
		quantity: record.quantity,
		step: record.step,
		unit: record.unit,
	};
}
