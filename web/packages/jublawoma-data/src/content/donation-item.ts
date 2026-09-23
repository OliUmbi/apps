import { idSchema } from "@oliumbi/contracts";
import {
	optionalTextSchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { donationItem } from "../schema";

export const donationItemKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationItemKey = z.infer<typeof donationItemKeySchema>;

export type DonationItem = typeof donationItem.$inferSelect;

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
