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

// A send names exactly one saved version of the draft (the caller's updatedAt
// token, the same optimistic-concurrency token a save carries). A token that no
// longer matches the saved row means the caller's editor is not on the saved
// version and would send a body nobody confirmed: the run is refused as the
// typed stale-draft outcome. Deliberately a result, not an error: the caller
// has a clear next step (reload/re-save) and nothing was queued.
export type CampaignSendOutcome = "queued" | "stale-draft";

// The plan's queue flag is a literal per outcome (a refusal cannot be planned
// as a queue run, and callers narrow on the flag): whether to queue recipients
// and mark the campaign queued. The stale-draft refusal never queues anything.
export type CampaignSendPlan =
	| { outcome: "queued"; queue: true }
	| { outcome: "stale-draft"; queue: false };

// The confirmation of a run refers to the exact saved version queued: savedAt
// is the saved row's updatedAt timestamp of the body that was queued.
export type CampaignSendResult =
	| { outcome: "queued"; count: number; savedAt: string }
	| { outcome: "stale-draft" };
