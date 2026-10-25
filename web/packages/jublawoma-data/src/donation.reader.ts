import type { DatabaseExecutor } from "@oliumbi/database";
import { eq, sql } from "drizzle-orm";
import { donationCommitment, donationItem } from "./schema";

// Quantities reach the site as decimal strings; display formatting happens there (D2).
export function createDonationReader(db: DatabaseExecutor) {
	return {
		items(donationId: string) {
			return db
				.select({
					id: donationItem.id,
					name: donationItem.name,
					detail: donationItem.detail,
					quantity: donationItem.quantity,
					step: donationItem.step,
					unit: donationItem.unit,
					remaining: sql<string>`greatest(0, ${donationItem.quantity} - coalesce(sum(${donationCommitment.quantity}), 0))::text`,
				})
				.from(donationItem)
				.leftJoin(
					donationCommitment,
					eq(donationCommitment.donationItemId, donationItem.id),
				)
				.where(eq(donationItem.donationId, donationId))
				.groupBy(donationItem.id)
				.orderBy(donationItem.createdAt, donationItem.id);
		},
	};
}
