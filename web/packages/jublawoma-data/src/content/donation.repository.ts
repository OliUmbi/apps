import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { donation } from "../schema";
import type { Donation, DonationInput, DonationKey } from "./donation";

export function createDonationRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Donation, DonationKey, DonationInput>(
		db,
		{
			table: donation,
			name: "jublawoma.donation",
			key: { id: donation.id },
			search: donation.title,
			createdAt: donation.createdAt,
			updatedAt: donation.updatedAt,
		},
	);
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
