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

// Teaser card payload: the excerpt is plain text produced with the list query,
// never the markdown body (D4).
export interface ShowcaseSummary {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	location: string;
	guestCount: number;
	image: ContentImage | null;
}

export interface PublicShowcase {
	id: string;
	slug: string;
	title: string;
	body: string;
	location: string;
	guestCount: number;
	image: ContentImage | null;
	publishedOn: string | null;
	gallery: ContentImage[];
}
