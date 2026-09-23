import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { campaign } from "../schema";
import type { CampaignInput, CampaignKey } from "./campaign";

export function createCampaignRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(campaign)
					.where(
						input.search
							? ilike(campaign.subject, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(campaign.createdAt), campaign.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: CampaignKey) {
			const [record] = await db
				.select()
				.from(campaign)
				.where(eq(campaign.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: CampaignInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(campaign)
				.values({
					subject: input.subject,
					body: input.body,
					status: "draft",
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: CampaignKey, input: CampaignInput) {
			const [record] = await db
				.update(campaign)
				.set({
					subject: input.subject,
					body: input.body,
					status: "draft",
					updatedAt: new Date().toISOString(),
				})
				.where(and(eq(campaign.id, key.id), eq(campaign.status, "draft")))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: CampaignKey): Promise<void> {
			await db.delete(campaign).where(eq(campaign.id, key.id));
		},
	};
}
