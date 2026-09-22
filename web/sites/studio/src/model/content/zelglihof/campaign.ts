import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { auditColumns, bodySchema, titleSchema } from "../validation";

export const campaignKeySchema = z.strictObject({
	id: idSchema,
});
export type CampaignKey = z.infer<typeof campaignKeySchema>;

export const campaignSchema = z.object({
	id: idSchema,
	subject: titleSchema,
	body: bodySchema,
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
