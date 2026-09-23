import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { donationItem } from "../schema";
import type { DonationItemInput, DonationItemKey } from "./donation-item";

export function createDonationItemRepository(db: DatabaseExecutor) {
	return {
		async get(key: DonationItemKey) {
			const [record] = await db
				.select()
				.from(donationItem)
				.where(eq(donationItem.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: DonationItemInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(donationItem)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: DonationItemKey, input: DonationItemInput) {
			const [record] = await db
				.update(donationItem)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(donationItem.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: DonationItemKey): Promise<void> {
			await db.delete(donationItem).where(eq(donationItem.id, key.id));
		},
		listForDonation(input: PageInput, donationId: string) {
			return paginate(
				db
					.select()
					.from(donationItem)
					.where(
						and(
							eq(donationItem.donationId, donationId),
							input.search
								? ilike(donationItem.name, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(desc(donationItem.createdAt), donationItem.id)
					.$dynamic(),
				input,
			);
		},
	};
}
