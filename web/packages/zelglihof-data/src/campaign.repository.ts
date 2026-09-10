import type { Transaction } from "@oliumbi/database";
import type { Campaign, CampaignRecipient } from "./campaign.types";
export function createCampaignRepository(sql: Transaction) {
	return {
		async lock(id: string) {
			const [campaign] = await sql<Campaign[]>`
				SELECT id, subject, body, status
				FROM zelglihof.campaign WHERE id = ${id} FOR UPDATE
			`;
			return campaign;
		},
		async recipients(afterId: string | null, limit: number) {
			return sql<CampaignRecipient[]>`
				SELECT id, email, unsubscribe_token AS "unsubscribeToken"
				FROM zelglihof.subscriber
				WHERE status = 'active' AND (${afterId}::uuid IS NULL OR id > ${afterId})
				ORDER BY id LIMIT ${limit}
				FOR SHARE
			`;
		},
		async markQueued(id: string, now: Date) {
			await sql`UPDATE zelglihof.campaign SET status = 'queued', updated_at = ${now} WHERE id = ${id}`;
		},
	};
}
