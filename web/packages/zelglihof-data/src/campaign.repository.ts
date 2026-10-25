import type { Transaction } from "@oliumbi/database";
import { and, eq, gt } from "drizzle-orm";
import type { CampaignDispatch, CampaignRecipient } from "./campaign.types";
import { campaign, subscriber } from "./schema";

// Dispatch workflow repository: loads the campaign and its recipients for one
// send run. Named for its role so it never reads like the studio CRUD
// repository in content/campaign.repository.ts.
export function createCampaignDispatchRepository(transaction: Transaction) {
	return {
		async lock(id: string): Promise<CampaignDispatch | undefined> {
			const [record] = await transaction
				.select({
					id: campaign.id,
					subject: campaign.subject,
					body: campaign.body,
					status: campaign.status,
				})
				.from(campaign)
				.where(eq(campaign.id, id))
				.for("update");
			return record;
		},
		recipients(
			afterId: string | null,
			limit: number,
		): Promise<CampaignRecipient[]> {
			return transaction
				.select({
					id: subscriber.id,
					email: subscriber.email,
					unsubscribeToken: subscriber.unsubscribeToken,
				})
				.from(subscriber)
				.where(
					and(
						eq(subscriber.status, "active"),
						afterId ? gt(subscriber.id, afterId) : undefined,
					),
				)
				.orderBy(subscriber.id)
				.limit(limit)
				.for("share");
		},
		async markQueued(id: string, now: Date) {
			await transaction
				.update(campaign)
				.set({ status: "queued", updatedAt: now.toISOString() })
				.where(eq(campaign.id, id));
		},
	};
}
