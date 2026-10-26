// Quantities and steps are exact decimal strings, not numbers (D2).
// The commitment workflow's view of the selected donation item, named for the
// workflow so it never reads like the managed record type in
// content/donation-item.ts.
export interface CommitmentItem {
	title: string;
	name: string;
	detail: string | null;
	quantity: string;
	step: string;
	unit: string;
	active: boolean;
}

// A donation item of the running donation with its remaining availability as
// the public page computes it. Written out on purpose: a renamed storage
// column must not silently change this shape.
export interface DonationItemAvailability {
	id: string;
	name: string;
	detail: string | null;
	quantity: string;
	step: string;
	unit: string;
	remaining: string;
}

// The outcome causes are distinct on purpose: a missing item, an inactive (not
// running) donation, an oversold item, and a wrong increment are different
// verdicts to a caller. A surface that only needs the coarse "can't have it"
// verdict folds them back together at its own boundary.
export type CommitmentOutcome =
	| "committed"
	| "not-found"
	| "inactive"
	| "oversold"
	| "invalid-increment";

export type CommitmentResult =
	| { outcome: "committed"; reference: string }
	| { outcome: "not-found" }
	| { outcome: "inactive" }
	| { outcome: "oversold" }
	| { outcome: "invalid-increment" };
