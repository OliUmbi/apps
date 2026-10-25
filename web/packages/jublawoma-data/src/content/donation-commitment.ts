import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const donationCommitmentKeySchema = z.strictObject({
	id: idSchema,
});
export type DonationCommitmentKey = z.infer<typeof donationCommitmentKeySchema>;

// The managed donation commitment record as it crosses the package boundary.
// Written out on purpose: a renamed storage column must not silently change
// this shape. Quantities stay exact decimal strings (D2); the nullable parent
// references keep orphaned commitments visible (database/README.md).
export interface DonationCommitment {
	id: string;
	donationId: string | null;
	donationItemId: string | null;
	donationTitle: string;
	itemName: string;
	itemDetail: string | null;
	itemQuantity: string;
	step: string;
	unit: string;
	name: string;
	phone: string;
	quantity: string;
	note: string | null;
	submissionId: string | null;
	createdAt: string;
	updatedAt: string;
}
