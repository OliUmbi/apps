import {
	bodySchema,
	idSchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const donationKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationKey = z.infer<typeof donationKeySchema>;

// The managed donation record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Donation {
	id: string;
	title: string;
	description: string;
	contact: string;
	startsAt: string;
	endsAt: string;
	createdAt: string;
	updatedAt: string;
}

export const donationInputSchema = z
	.strictObject({
		title: titleSchema,
		description: bodySchema,
		contact: titleSchema,
		startsAt: timestampSchema,
		endsAt: timestampSchema,
	})
	.refine(timestampRangeIsValid, {
		path: ["endsAt"],
		message: "End must follow start",
	});
export type DonationInput = z.infer<typeof donationInputSchema>;

export function newDonationInput(): DonationInput {
	return {
		title: "",
		description: "",
		contact: "",
		startsAt: "",
		endsAt: "",
	};
}

export function donationInputFromRecord(record: Donation): DonationInput {
	return {
		title: record.title,
		description: record.description,
		contact: record.contact,
		startsAt: record.startsAt,
		endsAt: record.endsAt,
	};
}
