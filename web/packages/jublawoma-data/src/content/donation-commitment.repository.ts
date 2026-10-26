import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { donationCommitment } from "../schema";
import type {
	DonationCommitment,
	DonationCommitmentKey,
} from "./donation-commitment";

export function createDonationCommitmentRepository(db: DatabaseExecutor) {
	// No input: commitment rows are written by the donation workflow with their
	// stored snapshots. Orphaned commitments (deleted donation) stay listed here;
	// the scoped list only shows a donation's own rows.
	const store = createContentRepository<
		DonationCommitment,
		DonationCommitmentKey,
		never
	>(db, {
		table: donationCommitment,
		name: "jublawoma.donation_commitment",
		key: { id: donationCommitment.id },
		search: donationCommitment.name,
		createdAt: donationCommitment.createdAt,
		updatedAt: donationCommitment.updatedAt,
		scope: donationCommitment.donationId,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		delete: store.delete,
		listForDonation: store.listScoped,
	});
}
