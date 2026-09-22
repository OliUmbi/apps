import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	optionalBodySchema,
	optionalTextSchema,
	titleSchema,
} from "../validation";

export const donationCommitmentKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationCommitmentKey = z.infer<typeof donationCommitmentKeySchema>;

export const donationCommitmentSchema = z.object({
	id: idSchema,
	donationId: idSchema.nullable(),
	donationItemId: idSchema.nullable(),
	donationTitle: titleSchema,
	itemName: titleSchema,
	itemDetail: optionalTextSchema,
	itemQuantity: z.coerce.number().nonnegative(),
	step: z.coerce.number().positive(),
	unit: titleSchema,
	name: titleSchema,
	phone: z.string(),
	quantity: z.coerce.number().nonnegative(),
	note: optionalBodySchema,
	...auditColumns,
});
export type DonationCommitment = z.infer<typeof donationCommitmentSchema>;
