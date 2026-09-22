import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	bodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const campaignKeySchema = z.strictObject({
	id: idSchema,
});
export type CampaignKey = z.infer<typeof campaignKeySchema>;

export const campaignSchema = z.object({
	id: idSchema,
	subject: z.string(),
	body: z.string(),
	status: z.enum(["draft", "queued"]),
	...auditColumns,
});
export type Campaign = z.infer<typeof campaignSchema>;

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
