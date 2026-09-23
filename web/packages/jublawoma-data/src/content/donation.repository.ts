import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { donation } from "../schema";
import type { DonationInput, DonationKey } from "./donation";

export function createDonationRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(donation)
					.where(
						input.search
							? ilike(donation.title, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(donation.createdAt), donation.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: DonationKey) {
			const [record] = await db
				.select()
				.from(donation)
				.where(eq(donation.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: DonationInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(donation)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: DonationKey, input: DonationInput) {
			const [record] = await db
				.update(donation)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(donation.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: DonationKey): Promise<void> {
			await db.delete(donation).where(eq(donation.id, key.id));
		},
	};
}
