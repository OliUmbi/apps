import type { DonationItem } from "./content/donation-item";

export type DonationAvailability = Pick<
	DonationItem,
	"id" | "name" | "detail" | "quantity" | "step" | "unit"
> & { remaining: number };
