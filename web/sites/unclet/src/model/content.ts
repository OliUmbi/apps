export interface ContentImage {
	id: string;
	src: string;
	alt: string;
}

export interface PublicReview {
	id: string;
	name: string;
	description: string;
	stars: number;
}

export interface ShowcaseSummary {
	id: string;
	slug: string;
	title: string;
	body: string;
	location: string;
	guestCount: number;
	image: ContentImage | null;
}

export interface PublicShowcase extends ShowcaseSummary {
	publishedOn: string | null;
	gallery: ContentImage[];
}
