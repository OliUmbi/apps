import type { Transaction } from "@oliumbi/database";
import { and, eq, gt } from "drizzle-orm";
import { campaign, subscriber } from "./schema";

export function createCampaignRepository(transaction: Transaction) {
	return {
		async lock(id: string) {
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
		recipients(afterId: string | null, limit: number) {
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
