import type { DatabasePool, Transaction } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { campaignEmail } from "./campaign.email";
import { createCampaignRepository } from "./campaign.repository";
import type { Campaign, CampaignOptions } from "./campaign.types";

const RECIPIENT_BATCH_SIZE = 100;

async function queueRecipients(
	sql: Transaction,
	campaign: Campaign,
	options: CampaignOptions,
) {
	const repository = createCampaignRepository(sql);
	const queue = createQueueClient(sql);
	let afterId: string | null = null;
	let count = 0;
	for (;;) {
		const recipients = await repository.recipients(
			afterId,
			RECIPIENT_BATCH_SIZE,
		);
		if (!recipients.length) return count;
		for (const recipient of recipients)
			await queue.enqueue(campaignEmail(campaign, recipient, options));
		count += recipients.length;
		afterId = recipients[recipients.length - 1].id;
	}
}

export function createCampaignService(
	database: DatabasePool,
	options: CampaignOptions,
) {
	return {
		send(id: string) {
			return database.transaction(async (sql) => {
				const repository = createCampaignRepository(sql);
				const campaign = await repository.lock(id);
				if (!campaign) throw new Error("Campaign not found");
				if (campaign.status !== "draft")
					throw new Error("Only draft campaigns can be sent");
				const count = await queueRecipients(sql, campaign, options);
				await repository.markQueued(id, new Date());
				return { count };
			});
		},
	};
}
