import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type DonationCommitmentKey,
	donationCommitmentSchema,
} from "./donation-commitment";

export function createDonationCommitmentRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "jublawoma.donation_commitment",
		selection: sql`id, donation_id AS "donationId", donation_item_id AS "donationItemId", donation_title AS "donationTitle", item_name AS "itemName", item_detail AS "itemDetail", item_quantity AS "itemQuantity", step, unit, name, phone, quantity, note, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: donationCommitmentSchema,
		keyColumns: (key: DonationCommitmentKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (_input: never) => ({}),
	});
	return {
		read: repository.read,
		list: repository.list,
		get: repository.get,
		delete: repository.delete,
		listForDonation(input: PageInput, donationId: string) {
			return repository.list(input, { donation_id: donationId });
		},
	};
}
