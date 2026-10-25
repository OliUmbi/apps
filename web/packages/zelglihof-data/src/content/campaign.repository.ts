import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { campaign } from "../schema";
import type { Campaign, CampaignInput, CampaignKey } from "./campaign";
import { updateMissError } from "./errors";

export function createCampaignRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Campaign>> {
			return paginate<Campaign>(
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
		async get(key: CampaignKey): Promise<Campaign | null> {
			const [record] = await db
				.select()
				.from(campaign)
				.where(eq(campaign.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: CampaignInput): Promise<Campaign> {
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
		async update(
			key: CampaignKey,
			input: CampaignInput,
			expectedUpdatedAt: string,
		): Promise<Campaign> {
			const [record] = await db
				.update(campaign)
				.set({
					subject: input.subject,
					body: input.body,
					status: "draft",
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(campaign.id, key.id),
						eq(campaign.status, "draft"),
						eq(campaign.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.campaign",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: CampaignKey): Promise<void> {
			await db.delete(campaign).where(eq(campaign.id, key.id));
		},
	};
}
