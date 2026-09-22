import type { Database, Transaction } from "@oliumbi/database";
import {
	type DonationInput,
	type DonationKey,
	donationSchema,
} from "../../../model/content/jublawoma/donation";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function donationStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "jublawoma.donation",
		selection: sql`id, title, description, contact, starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: donationSchema,
		keyColumns: (key: DonationKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "title",
		writeColumns: (input: DonationInput) => ({
			title: input.title,
			description: input.description,
			contact: input.contact,
			starts_at: input.startsAt,
			ends_at: input.endsAt,
		}),
	});
}
