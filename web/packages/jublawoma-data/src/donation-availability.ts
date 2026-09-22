import { z } from "zod";
import { donationItemSchema } from "./content/donation-item";

export const donationAvailabilitySchema = donationItemSchema
	.pick({
		id: true,
		name: true,
		detail: true,
		quantity: true,
		step: true,
		unit: true,
	})
	.extend({ remaining: z.coerce.number().nonnegative() });

export type DonationAvailability = z.infer<typeof donationAvailabilitySchema>;
