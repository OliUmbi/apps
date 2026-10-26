import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { campaign } from "../schema";
import type { Campaign, CampaignInput, CampaignKey } from "./campaign";

export function createCampaignRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Campaign, CampaignKey, CampaignInput>(
		db,
		{
			table: campaign,
			name: "zelglihof.campaign",
			key: { id: campaign.id },
			search: campaign.subject,
			createdAt: campaign.createdAt,
			updatedAt: campaign.updatedAt,
			// A campaign is only editable while it is a draft, and editing keeps it
			// one; a queued or sent campaign is not editable rather than a conflict.
			guard: { column: campaign.status, field: "status", value: "draft" },
		},
	);
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
