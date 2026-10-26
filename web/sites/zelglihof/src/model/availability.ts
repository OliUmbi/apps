import { m } from "@oliumbi/i18n/messages";
import type {
	ProductAvailability,
	VariantStock,
} from "@oliumbi/zelglihof-data/reservation.service";

// Availability wording is translated here at the site boundary: the data layer
// decides the state and names the catalog key, never renders text.
export function availabilityLabel(availability: ProductAvailability): string {
	return m[availability.labelKey]();
}

// The stock line per variant; null when the variant carries no tracked stock.
export function stockLabel(stock: VariantStock): string | null {
	if (stock.labelKey === null) return null;
	return stock.labelKey === "zelglihof_variant_stock_remaining"
		? m.zelglihof_variant_stock_remaining({ quantity: stock.remaining ?? 0 })
		: m.zelglihof_availability_sold_out();
}
