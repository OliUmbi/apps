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

export type CommitmentOutcome =
	| "committed"
	| "unavailable"
	| "invalid-increment";

export type CommitmentResult =
	| { outcome: "committed"; reference: string }
	| { outcome: "unavailable" }
	| { outcome: "invalid-increment" };
