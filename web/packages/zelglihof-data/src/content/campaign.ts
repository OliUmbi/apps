import { idSchema } from "@oliumbi/contracts";
import { bodySchema, titleSchema } from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { campaign } from "../schema";

export const campaignKeySchema = z.strictObject({
	id: idSchema,
});
export type CampaignKey = z.infer<typeof campaignKeySchema>;

export type Campaign = typeof campaign.$inferSelect;

export const campaignInputSchema = z.strictObject({
	subject: titleSchema,
	body: bodySchema,
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export function newCampaignInput(): CampaignInput {
	return {
		subject: "",
		body: "",
	};
}

export function campaignInputFromRecord(record: Campaign): CampaignInput {
	return {
		subject: record.subject,
		body: record.body,
	};
}
