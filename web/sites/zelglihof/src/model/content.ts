import type {
	ProductAvailability,
	VariantStock,
} from "@oliumbi/zelglihof-data/reservation.service";

export interface PublicPromotion {
	id: string;
	title: string;
	description: string;
	link: string;
}

export interface ProductSummary {
	id: string;
	name: string;
	description: string;
	image: string;
	// Decided once in `zelglihof-data` against the database clock: the state
	// drives behavior, the label key names the string the component renders.
	availability: ProductAvailability;
	reservationOpen: boolean;
}

export interface Product extends ProductSummary {
	body: string;
	variants: {
		id: string;
		name: string;
		price: string;
		description: string;
		image: string;
		stock: VariantStock;
	}[];
}

export interface UpdateSummary {
	id: string;
	slug: string;
	title: string;
	description: string;
	image: string;
	// Server-formatted display date and the machine-readable day behind it.
	date: string;
	dateIso: string;
}

export interface Update extends UpdateSummary {
	body: string;
	images: { id: string; src: string; description: string }[];
}
