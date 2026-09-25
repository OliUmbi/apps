export interface PublicPromotion {
	id: string;
	title: string;
	description: string;
	link: string;
}

export interface ProductSummary {
	id: string;
	name: string;
	eyebrow: string;
	description: string;
	image: string;
	availability: string;
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
		quantity: number | null;
	}[];
}
export interface UpdateSummary {
	id: string;
	slug: string;
	title: string;
	description: string;
	image: string;
	date: string;
	category: string;
}

export interface Update extends UpdateSummary {
	body: string;
	images: { id: string; src: string; description: string }[];
}
