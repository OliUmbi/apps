export interface MediaAsset {
	id: string;
	storageKey: string;
	altText: string;
	role: "cover" | "gallery";
	position: number;
}

export interface EventRecord {
	id: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	startsOn: string;
	endsOn: string;
	location: string;
	registrationUrl: string | null;
	media: MediaAsset[];
}

export interface StoryRecord {
	id: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	publishedOn: string | null;
	media: MediaAsset[];
}
