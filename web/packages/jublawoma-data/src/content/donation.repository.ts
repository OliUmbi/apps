import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type DonationInput,
	type DonationKey,
	donationSchema,
} from "./donation";

export function createDonationRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
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
