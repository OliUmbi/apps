// Quantities and steps are exact decimal strings, not numbers (D2).
export interface DonationItem {
	title: string;
	name: string;
	detail: string | null;
	quantity: string;
	step: string;
	unit: string;
	active: boolean;
}

export type CommitmentOutcome =
	| "committed"
	| "unavailable"
	| "invalid-increment";

export type CommitmentResult =
	| { outcome: "committed"; reference: string }
	| { outcome: "unavailable" }
	| { outcome: "invalid-increment" };
