import type { Database, Transaction } from "@oliumbi/database";
import {
	type DonationCommitmentKey,
	donationCommitmentSchema,
} from "../../../model/content/jublawoma/donation-commitment";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function donationCommitmentStore(
	sql: Database | Transaction = database.sql,
) {
	return createContentStore(sql, {
		table: "jublawoma.donation_commitment",
		selection: sql`id, donation_id AS "donationId", donation_item_id AS "donationItemId", donation_title AS "donationTitle", item_name AS "itemName", item_detail AS "itemDetail", item_quantity AS "itemQuantity", step, unit, name, phone, quantity, note, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: donationCommitmentSchema,
		keyColumns: (key: DonationCommitmentKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (_input: never) => ({}),
	});
}
