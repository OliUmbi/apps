import { guardRepository, type Page, type PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { donationCommitment } from "../schema";
import type {
	DonationCommitment,
	DonationCommitmentKey,
} from "./donation-commitment";

export function createDonationCommitmentRepository(db: DatabaseExecutor) {
	return guardRepository({
		// Orphaned commitments (deleted donation) stay listed here with their
		// stored snapshots; the scoped list only shows a donation's own rows.
		list(input: PageInput): Promise<Page<DonationCommitment>> {
			return paginate<DonationCommitment>(
				db
					.select()
					.from(donationCommitment)
					.where(
						input.search
							? ilike(donationCommitment.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(donationCommitment.createdAt), donationCommitment.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: DonationCommitmentKey): Promise<DonationCommitment | null> {
			const [record] = await db
				.select()
				.from(donationCommitment)
				.where(eq(donationCommitment.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async delete(key: DonationCommitmentKey): Promise<void> {
			await db
				.delete(donationCommitment)
				.where(eq(donationCommitment.id, key.id));
		},
		listForDonation(
			input: PageInput,
			donationId: string,
		): Promise<Page<DonationCommitment>> {
			return paginate<DonationCommitment>(
				db
					.select()
					.from(donationCommitment)
					.where(
						and(
							eq(donationCommitment.donationId, donationId),
							input.search
								? ilike(donationCommitment.name, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(desc(donationCommitment.createdAt), donationCommitment.id)
					.$dynamic(),
				input,
			);
		},
	});
}
