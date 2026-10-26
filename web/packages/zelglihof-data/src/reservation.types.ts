import type { Product } from "./content/product";
import type { ProductVariant } from "./content/product-variant";

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
export interface ReservationPlan {
	outcome: ReservationResult["outcome"];
	insert: boolean;
}

/*
 * Availability policy: the single decision point behind the public display and
 * the reservation write path. The reservation window is evaluated by the
 * database clock in SQL (`now()`), so a rendered page and a reservation attempt
 * can never disagree at a window edge. Display strings stay in the site's
 * message catalog; this package returns the state and names the catalog key.
 */

export type ProductAvailabilityState =
	| "reservation-open" // reservable, in its window, at least one variant with stock
	| "sold-out" // reservable, in its window, every variant exhausted
	| "off-season" // reservable, outside its reservation window
	| "farm-shop"; // not reservable: sold over the farm-shop counter

export type AvailabilityLabelKey =
	| "zelglihof_availability_reservation_open"
	| "zelglihof_availability_sold_out"
	| "zelglihof_availability_off_season"
	| "zelglihof_availability_farm_shop";

export interface ProductAvailability {
	state: ProductAvailabilityState;
	labelKey: AvailabilityLabelKey;
}

export type VariantStockState = "untracked" | "in-stock" | "sold-out";

export type VariantStockLabelKey =
	| "zelglihof_variant_stock_remaining"
	| "zelglihof_availability_sold_out";

export interface VariantStock {
	state: VariantStockState;
	remaining: number | null;
	// Catalog key for the stock line; null when the variant carries no tracked
	// stock and no stock line should render.
	labelKey: VariantStockLabelKey | null;
}

// One product record plus its computed availability; callers never re-derive
// policy from raw timestamps.
export type AvailableProduct = Product & { availability: ProductAvailability };
export type AvailableVariant = ProductVariant & { stock: VariantStock };

export function productAvailability(input: {
	reservable: boolean;
	windowOpen: boolean;
	stock: readonly (number | null)[];
}): ProductAvailability {
	if (!input.reservable)
		return { state: "farm-shop", labelKey: "zelglihof_availability_farm_shop" };
	if (!input.windowOpen)
		return {
			state: "off-season",
			labelKey: "zelglihof_availability_off_season",
		};
	// A variant with untracked stock counts as available; exhausted ones do not,
	// so a product whose variants are all sold out is never "reservation open".
	const hasStock = input.stock.some(
		(quantity) => quantity === null || quantity > 0,
	);
	return hasStock
		? {
				state: "reservation-open",
				labelKey: "zelglihof_availability_reservation_open",
			}
		: { state: "sold-out", labelKey: "zelglihof_availability_sold_out" };
}

export function variantStock(quantity: number | null): VariantStock {
	if (quantity === null)
		return { state: "untracked", remaining: null, labelKey: null };
	if (quantity <= 0)
		return {
			state: "sold-out",
			remaining: 0,
			labelKey: "zelglihof_availability_sold_out",
		};
	return {
		state: "in-stock",
		remaining: quantity,
		labelKey: "zelglihof_variant_stock_remaining",
	};
}
