import { idSchema } from "@oliumbi/contracts";
import { auditColumns } from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const donationCommitmentKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationCommitmentKey = z.infer<typeof donationCommitmentKeySchema>;

export const donationCommitmentSchema = z.object({
	id: idSchema,
	donationId: idSchema.nullable(),
	donationItemId: idSchema.nullable(),
	donationTitle: z.string(),
	itemName: z.string(),
	itemDetail: z.string().nullable(),
	itemQuantity: z.coerce.number().nonnegative(),
	step: z.coerce.number().positive(),
	unit: z.string(),
	name: z.string(),
	phone: z.string(),
	quantity: z.coerce.number().nonnegative(),
	note: z.string().nullable(),
	...auditColumns,
});
export type DonationCommitment = z.infer<typeof donationCommitmentSchema>;
