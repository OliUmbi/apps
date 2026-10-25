import type { CampaignStatus } from "./statuses";

// The campaign as loaded by the dispatch workflow: only the fields the send
// path reads. Written out on purpose: a renamed storage column must not
// silently change this shape.
export interface CampaignDispatch {
	id: string;
	subject: string;
	body: string;
	status: CampaignStatus;
}
export interface CampaignRecipient {
	id: string;
	email: string;
	unsubscribeToken: string;
}
export interface CampaignOptions {
	/** sending identity for subscriber mail (newsletter@) */
	sender: string;
	/** human inbox replies go to (requests@) */
	replyTo: string;
	publicUrl: string;
}
