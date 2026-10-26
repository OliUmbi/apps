import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { donationItem } from "../schema";
import type {
	DonationItem,
	DonationItemInput,
	DonationItemKey,
} from "./donation-item";

export function createDonationItemRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		DonationItem,
		DonationItemKey,
		DonationItemInput
	>(db, {
		table: donationItem,
		name: "jublawoma.donation_item",
		key: { id: donationItem.id },
		search: donationItem.name,
		createdAt: donationItem.createdAt,
		updatedAt: donationItem.updatedAt,
		scope: donationItem.donationId,
		// The parent reference is an identity column: an item cannot be moved to
		// another donation by a key/values mismatch.
		parent: { column: donationItem.donationId, field: "donationId" },
	});
	return guardRepository({
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
		listForDonation: store.listScoped,
	});
}
