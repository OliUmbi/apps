import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { auditColumns, optionalTextSchema, titleSchema } from "../validation";

export const donationItemKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationItemKey = z.infer<typeof donationItemKeySchema>;

export const donationItemSchema = z.object({
	id: idSchema,
	donationId: idSchema,
	name: titleSchema,
	detail: optionalTextSchema,
	quantity: z.coerce.number().nonnegative(),
	step: z.coerce.number().positive(),
	unit: titleSchema,
	...auditColumns,
});
export type DonationItem = z.infer<typeof donationItemSchema>;

export const donationItemInputSchema = z.strictObject({
	donationId: idSchema,
	name: titleSchema,
	detail: optionalTextSchema,
	quantity: z.number().nonnegative(),
	step: z.number().positive(),
	unit: titleSchema,
});
export type DonationItemInput = z.infer<typeof donationItemInputSchema>;

export function newDonationItemInput(donationId: string): DonationItemInput {
	return {
		donationId: donationId,
		name: "",
		detail: null,
		quantity: 1,
		step: 0.5,
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
