export interface Product {
	id: string;
	name: string;
	shortName: string;
	eyebrow: string;
	description: string;
	longDescription: string;
	image: string;
	availability: string;
	kind: "reservable" | "shop" | "seasonal";
	variants: {
		id: string;
		name: string;
		price: string;
		description: string;
		image: string;
		quantity: number | null;
	}[];
}
export interface Update {
	id: string;
	slug: string;
	title: string;
	description: string;
	body: string;
	image: string;
	date: string;
	category: string;
	images: { id: string; src: string; description: string }[];
}
