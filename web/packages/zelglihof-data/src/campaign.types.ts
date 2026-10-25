import type { campaign, subscriber } from "./schema";

export type Campaign = Pick<
	typeof campaign.$inferSelect,
	"id" | "subject" | "body" | "status"
>;
export type CampaignRecipient = Pick<
	typeof subscriber.$inferSelect,
	"id" | "email" | "unsubscribeToken"
>;
export interface CampaignOptions {
	/** sending identity for subscriber mail (newsletter@) */
	sender: string;
	/** human inbox replies go to (requests@) */
	replyTo: string;
	publicUrl: string;
}
