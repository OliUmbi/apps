export interface ReservableVariant {
	productName: string;
	variantName: string;
	description: string | null;
	price: string;
	quantity: number | null;
	available: boolean;
}
export type ReservationResult =
	| { outcome: "reserved"; reference: string }
	| { outcome: "unavailable" };
