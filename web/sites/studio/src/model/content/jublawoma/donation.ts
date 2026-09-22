import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	bodySchema,
	databaseTimestampSchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "../validation";

export const donationKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationKey = z.infer<typeof donationKeySchema>;

export const donationSchema = z.object({
	id: idSchema,
	title: titleSchema,
	description: bodySchema,
	contact: titleSchema,
	startsAt: databaseTimestampSchema,
	endsAt: databaseTimestampSchema,
	...auditColumns,
});
export type Donation = z.infer<typeof donationSchema>;

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
