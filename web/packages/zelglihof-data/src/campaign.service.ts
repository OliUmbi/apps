import { AppError, mapErrors } from "@oliumbi/contracts";
import type { DatabasePool, Transaction } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { campaignEmail } from "./campaign.email";
import { createCampaignDispatchRepository } from "./campaign.repository";
import type { CampaignDispatch, CampaignOptions } from "./campaign.types";

const RECIPIENT_BATCH_SIZE = 100;

async function queueRecipients(
	transaction: Transaction,
	campaign: CampaignDispatch,
	options: CampaignOptions,
) {
	const repository = createCampaignDispatchRepository(transaction);
	const queue = createQueueClient(transaction);
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
			// One boundary: driver failures leave as classified
			// conflict/not-found/internal errors, never raw database errors.
			return mapErrors(async () => {
				return database.transaction(async (transaction) => {
					const repository = createCampaignDispatchRepository(transaction);
					const campaign = await repository.lock(id);
					if (!campaign) throw new AppError("not-found", "Campaign not found");
					// A state guard is a forbidden verdict, not a concurrency conflict.
					if (campaign.status !== "draft")
						throw new AppError("forbidden", "Only draft campaigns can be sent");
					const count = await queueRecipients(transaction, campaign, options);
					await repository.markQueued(id, new Date());
					return { count };
				});
			});
		},
	};
}
