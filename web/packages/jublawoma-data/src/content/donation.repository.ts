import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { donation } from "../schema";
import type { Donation, DonationInput, DonationKey } from "./donation";
import { updateMissError } from "./errors";

export function createDonationRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Donation>> {
			return paginate<Donation>(
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
		async get(key: DonationKey): Promise<Donation | null> {
			const [record] = await db
				.select()
				.from(donation)
				.where(eq(donation.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: DonationInput): Promise<Donation> {
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
		async update(
			key: DonationKey,
			input: DonationInput,
			expectedUpdatedAt: string,
		): Promise<Donation> {
			const [record] = await db
				.update(donation)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(donation.id, key.id),
						eq(donation.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"jublawoma.donation",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: DonationKey): Promise<void> {
			await db.delete(donation).where(eq(donation.id, key.id));
		},
	};
}
