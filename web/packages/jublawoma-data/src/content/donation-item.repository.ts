import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type DonationItemInput,
	type DonationItemKey,
	donationItemSchema,
} from "./donation-item";

export function createDonationItemRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
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
	return {
		...repository,
		listForDonation(input: PageInput, donationId: string) {
			return repository.list(input, { donation_id: donationId });
		},
	};
}
