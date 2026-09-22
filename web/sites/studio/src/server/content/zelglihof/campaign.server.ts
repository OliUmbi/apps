import type { Database, Transaction } from "@oliumbi/database";
import {
	type CampaignInput,
	type CampaignKey,
	campaignSchema,
} from "../../../model/content/zelglihof/campaign";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function campaignStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
