export interface ContentImage {
	id: string;
	src: string;
	alt: string;
}

export interface PublicPromotion {
	id: string;
	title: string;
	description: string;
	link: string;
	image: ContentImage | null;
}

export interface PublicMember {
	id: string;
	name: string;
	groupName: string;
	leadership: boolean;
	image: ContentImage | null;
}

export interface PublicEvent {
	id: string;
	title: string;
	description: string;
	startsOn: string;
	endsOn: string;
	location: string;
	image: ContentImage | null;
}

export interface StorySummary {
	id: string;
	slug: string;
	title: string;
	description: string;
	publishedOn: string | null;
	image: ContentImage | null;
}

export interface PublicStory extends StorySummary {
	body: string;
	author: string;
	gallery: ContentImage[];
}
