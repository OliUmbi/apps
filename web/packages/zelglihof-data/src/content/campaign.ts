import { bodySchema, idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { CampaignStatus } from "../statuses";

export const campaignKeySchema = z.strictObject({
	id: idSchema,
});
export type CampaignKey = z.infer<typeof campaignKeySchema>;

// The managed campaign record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Campaign {
	id: string;
	subject: string;
	body: string;
	status: CampaignStatus;
	createdAt: string;
	updatedAt: string;
}

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
