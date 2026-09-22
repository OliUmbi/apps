import type { Database, Transaction } from "@oliumbi/database";
import {
	type DonationItemInput,
	type DonationItemKey,
	donationItemSchema,
} from "../../../model/content/jublawoma/donation-item";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function donationItemStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "jublawoma.donation_item",
		selection: sql`id, donation_id AS "donationId", name, detail, quantity, step, unit, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: donationItemSchema,
		keyColumns: (key: DonationItemKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: DonationItemInput) => ({
			donation_id: input.donationId,
			name: input.name,
			detail: input.detail,
			quantity: input.quantity,
			step: input.step,
			unit: input.unit,
		}),
	});
}
