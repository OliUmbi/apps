import type { SqlExecutor } from "@oliumbi/database";
import { donationAvailabilitySchema } from "./donation-availability";

export function createDonationReader(sql: SqlExecutor) {
	return {
		async items(donationId: string) {
			const rows = await sql`
    SELECT item.id, item.name, item.detail, item.quantity, item.step, item.unit,
     greatest(0, item.quantity - coalesce(sum(commitment.quantity), 0)) AS remaining
    FROM jublawoma.donation_item item
    LEFT JOIN jublawoma.donation_commitment commitment ON commitment.donation_item_id = item.id
    WHERE item.donation_id = ${donationId}
    GROUP BY item.id ORDER BY item.created_at, item.id
   `;
			return rows.map((row) => donationAvailabilitySchema.parse(row));
		},
	};
}
