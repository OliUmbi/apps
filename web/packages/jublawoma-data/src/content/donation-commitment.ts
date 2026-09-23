import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { donationCommitment } from "../schema";

export const donationCommitmentKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationCommitmentKey = z.infer<typeof donationCommitmentKeySchema>;

export type DonationCommitment = typeof donationCommitment.$inferSelect;
