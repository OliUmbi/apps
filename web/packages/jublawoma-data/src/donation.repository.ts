import type { Transaction } from "@oliumbi/database";
import { and, eq, sql } from "drizzle-orm";
import type { DonationItem } from "./donation.types";
import type { CommitmentInput } from "./forms";
import { donation, donationCommitment, donationItem } from "./schema";

export function createDonationRepository(transaction: Transaction) {
	return {
		async lockItem(input: CommitmentInput) {
			const [item] = await transaction
				.select({
					title: donation.title,
					name: donationItem.name,
					detail: donationItem.detail,
					// Exact decimal strings; numeric stays authoritative in PostgreSQL (D2).
					quantity: donationItem.quantity,
					step: donationItem.step,
					unit: donationItem.unit,
					active: sql<boolean>`${donation.startsAt} <= now() AND ${donation.endsAt} >= now()`,
				})
				.from(donation)
				.innerJoin(donationItem, eq(donationItem.donationId, donation.id))
				.where(
					and(
						eq(donation.id, input.donationId),
						eq(donationItem.id, input.itemId),
					),
				)
				.for("update");
			return item;
		},
		async findBySubmissionId(submissionId: string) {
			const [row] = await transaction
				.select({ id: donationCommitment.id })
				.from(donationCommitment)
				.where(eq(donationCommitment.submissionId, submissionId))
				.limit(1);
			return row ?? null;
		},
		async committedQuantity(itemId: string) {
			const [row] = await transaction
				.select({
					quantity: sql<string>`coalesce(sum(${donationCommitment.quantity}), 0)::text`,
				})
				.from(donationCommitment)
				.where(eq(donationCommitment.donationItemId, itemId));
			return row.quantity;
		},
		async insert(input: CommitmentInput, item: DonationItem, now: Date) {
			const inserted = await transaction
				.insert(donationCommitment)
				.values({
					submissionId: input.submissionId,
					donationId: input.donationId,
					donationItemId: input.itemId,
					donationTitle: item.title,
					itemName: item.name,
					itemDetail: item.detail,
					itemQuantity: item.quantity,
					step: item.step,
					unit: item.unit,
					name: input.name,
					phone: input.phone,
					quantity: input.quantity,
					note: input.note || null,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				})
				.onConflictDoNothing({ target: donationCommitment.submissionId })
				.returning({ id: donationCommitment.id });
			return inserted.length > 0;
		},
	};
}
