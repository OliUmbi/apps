import type { Transaction } from "@oliumbi/database";
import type { DonationItem } from "./donation.types";
import type { CommitmentInput } from "./forms";

export function createDonationRepository(sql: Transaction) {
	return {
		async lockItem(input: CommitmentInput) {
			const [item] = await sql<DonationItem[]>`
				SELECT d.title, i.name, i.description, i.quantity::float8, i.step::float8,
						i.unit, (d.starts_at <= now() AND d.ends_at >= now()) AS active
				FROM jublawoma.donation d
				JOIN jublawoma.donation_item i ON i.donation_id = d.id
				WHERE d.id = ${input.donationId} AND i.id = ${input.itemId}
				FOR UPDATE OF d, i
			`;
			return item;
		},
		async committedQuantity(itemId: string) {
			const [row] = await sql<{ quantity: number }[]>`
				SELECT coalesce(sum(quantity), 0)::float8 AS quantity
				FROM jublawoma.donation_commitment
				WHERE donation_item_id = ${itemId}
			`;
			return row.quantity;
		},
		async insert(input: CommitmentInput, item: DonationItem, now: Date) {
			await sql`
				INSERT INTO jublawoma.donation_commitment (
					donation_id, donation_item_id, donation_title, item_name, item_description,
					item_quantity, step, unit, name, phone, quantity, note, created_at, updated_at
				) VALUES (
					${input.donationId}, ${input.itemId}, ${item.title}, ${item.name},
					${item.description}, ${item.quantity}, ${item.step}, ${item.unit},
					${input.name}, ${input.phone}, ${input.quantity}, ${input.note || null},
					${now}, ${now}
				)
			`;
		},
	};
}
