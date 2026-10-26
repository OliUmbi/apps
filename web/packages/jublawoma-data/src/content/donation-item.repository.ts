import {
	guardRepository,
	type Page,
	type PageInput,
	recordNotCreatedError,
} from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { donationItem } from "../schema";
import type {
	DonationItem,
	DonationItemInput,
	DonationItemKey,
} from "./donation-item";
import { updateMissError } from "./errors";

export function createDonationItemRepository(db: DatabaseExecutor) {
	return guardRepository({
		async get(key: DonationItemKey): Promise<DonationItem | null> {
			const [record] = await db
				.select()
				.from(donationItem)
				.where(eq(donationItem.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: DonationItemInput): Promise<DonationItem> {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(donationItem)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw recordNotCreatedError();
			return record;
		},
		async update(
			key: DonationItemKey,
			input: DonationItemInput,
			expectedUpdatedAt: string,
		): Promise<DonationItem> {
			// The parent reference is an identity column: it is never written on
			// update, so an item cannot be moved to another donation by a
			// key/values mismatch.
			const [record] = await db
				.update(donationItem)
				.set({
					name: input.name,
					detail: input.detail,
					quantity: input.quantity,
					step: input.step,
					unit: input.unit,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(donationItem.id, key.id),
						eq(donationItem.donationId, input.donationId),
						eq(donationItem.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (record) return record;
			const current = await this.get(key);
			throw updateMissError(
				"jublawoma.donation_item",
				current,
				expectedUpdatedAt,
				current?.donationId === input.donationId,
			);
		},
		async delete(key: DonationItemKey): Promise<void> {
			await db.delete(donationItem).where(eq(donationItem.id, key.id));
		},
		listForDonation(
			input: PageInput,
			donationId: string,
		): Promise<Page<DonationItem>> {
			return paginate<DonationItem>(
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
	});
}
