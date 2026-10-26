import { AppError, mapErrors } from "@oliumbi/contracts";
import type { DatabasePool, Transaction } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { campaignEmail } from "./campaign.email";
import { createCampaignDispatchRepository } from "./campaign.repository";
import type {
	CampaignDispatch,
	CampaignOptions,
	CampaignSendPlan,
	CampaignSendResult,
} from "./campaign.types";
import { createCampaignRepository } from "./content/campaign.repository";

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

// Pure decision point: a send names exactly one saved version of the draft -
// the caller's updatedAt token (the optimistic-concurrency token a save
// carries). A token that no longer matches the saved row means the caller's
// editor is not on the saved version, so what would be queued is not what the
// caller confirmed: the run is refused as the typed stale-draft outcome and
// nothing is queued. A refused run is a clear verdict, never an error stack.
export function decideCampaignSend(input: {
	expectedUpdatedAt: string;
	savedUpdatedAt: string;
}): CampaignSendPlan {
	if (input.expectedUpdatedAt !== input.savedUpdatedAt)
		return { outcome: "stale-draft", queue: false };
	return { outcome: "queued", queue: true };
}

export function createCampaignService(
	database: DatabasePool,
	options: CampaignOptions,
) {
	return {
		send(id: string, expectedUpdatedAt: string): Promise<CampaignSendResult> {
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
					// The saved version's updatedAt token: the CRUD repository reads the
					// same locked row, so this is the version the run would queue.
					const saved = await createCampaignRepository(transaction).get({ id });
					if (!saved) throw new AppError("not-found", "Campaign not found");
					const plan = decideCampaignSend({
						expectedUpdatedAt,
						savedUpdatedAt: saved.updatedAt,
					});
					if (!plan.queue) return { outcome: plan.outcome };
					const count = await queueRecipients(transaction, campaign, options);
					await repository.markQueued(id, new Date());
					return { outcome: "queued", count, savedAt: saved.updatedAt };
				});
			});
		},
	};
}
