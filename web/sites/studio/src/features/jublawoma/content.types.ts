export interface ManagedMedia {
	id: string;
	storageKey: string;
	altText: string;
	role: "cover" | "gallery";
	position: number;
}

export interface ManagedEvent {
	id: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	startsOn: string;
	endsOn: string;
	location: string;
	registrationUrl: string | null;
	status: "draft" | "published" | "cancelled";
	media: ManagedMedia[];
}

export interface ManagedStory {
	id: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	publishedOn: string | null;
	status: "draft" | "published";
	media: ManagedMedia[];
}

export interface MediaInput {
	storageKey: string;
	altText: string;
	role: "cover" | "gallery";
	position: number;
}

export interface EventInput {
	id?: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	startsOn: string;
	endsOn: string;
	location: string;
	registrationUrl: string;
	status: ManagedEvent["status"];
	media: MediaInput[];
}

export interface StoryInput {
	id?: string;
	slug: string;
	title: string;
	summary: string;
	bodyMarkdown: string;
	publishedOn: string;
	status: ManagedStory["status"];
	media: MediaInput[];
}
