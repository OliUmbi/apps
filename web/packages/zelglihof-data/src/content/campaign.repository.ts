import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type CampaignInput,
	type CampaignKey,
	campaignSchema,
} from "./campaign";

export function createCampaignRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
		table: "zelglihof.campaign",
		selection: sql`id, subject, body, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: campaignSchema,
		keyColumns: (key: CampaignKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "subject",
		writeColumns: (input: CampaignInput) => ({
			subject: input.subject,
			body: input.body,
			status: "draft",
		}),
		editable: { status: "draft" },
	});
}
