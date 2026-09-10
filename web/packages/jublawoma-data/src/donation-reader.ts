import type { ResourceRecord } from "@oliumbi/contracts";
import type { Database } from "@oliumbi/database";

export function createDonationReader(sql: Database) {
	return {
		items(donationId: string) {
			return sql<ResourceRecord[]>`
				SELECT item.id, item.name, item.description,
					item.quantity::float8, item.step::float8, item.unit,
					greatest(0, item.quantity - coalesce(sum(commitment.quantity), 0))::float8 AS remaining
				FROM jublawoma.donation_item item
				LEFT JOIN jublawoma.donation_commitment commitment
					ON commitment.donation_item_id = item.id
				WHERE item.donation_id = ${donationId}
				GROUP BY item.id
				ORDER BY item.created_at, item.id
			`;
		},
	};
}
