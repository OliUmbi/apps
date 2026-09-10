export interface MediaAsset {
	id: string;
	storageKey: string;
	altText: string;
	role: "cover" | "gallery";
	position: number;
}
export interface EventRecord {
	id: string;
	title: string;
	summary: string;
	startsOn: string;
	endsOn: string;
	location: string;
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
