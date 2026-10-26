// The studio forms read typed service outcomes through one pure branch per
// form, so a refusal can never render as a success. The server functions
// surface outcomes as clean values; these verdicts are what the caller sees.
// Pure on purpose: the branch is pinned by tests.

export type CorrectionFeedback = "idle" | "corrected" | "conflict" | "failed";

// An address correction that resolves to "conflict" changed nothing (the
// address is already subscribed elsewhere): it is a refusal, never a success.
export function correctionFeedback(input: {
	failed: boolean;
	result: { outcome: "corrected" | "conflict" } | null | undefined;
}): CorrectionFeedback {
	if (input.failed) return "failed";
	if (input.result?.outcome === "conflict") return "conflict";
	if (input.result?.outcome === "corrected") return "corrected";
	return "idle";
}

export type CampaignSendFeedback = "idle" | "queued" | "stale-draft" | "failed";

// A send that resolves to "stale-draft" queued nothing: the confirmation
// dialog stays open with its reload/re-save action instead of closing like a
// queued run.
export function campaignSendFeedback(input: {
	failed: boolean;
	result: { outcome: "queued" | "stale-draft" } | null | undefined;
}): CampaignSendFeedback {
	if (input.failed) return "failed";
	if (input.result?.outcome === "stale-draft") return "stale-draft";
	if (input.result?.outcome === "queued") return "queued";
	return "idle";
}
