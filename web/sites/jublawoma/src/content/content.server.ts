import {
	findPublishedEvents,
	findPublishedStories,
} from "./content.repository";
import type { EventRecord, StoryRecord } from "./types";

export function publishedEvents(): Promise<EventRecord[]> {
	return findPublishedEvents();
}

export async function publishedEvent(
	slug: string,
): Promise<EventRecord | null> {
	return (
		(await findPublishedEvents()).find((event) => event.slug === slug) ?? null
	);
}

export function publishedStories(): Promise<StoryRecord[]> {
	return findPublishedStories();
}

export async function publishedStory(
	slug: string,
): Promise<StoryRecord | null> {
	return (
		(await findPublishedStories()).find((story) => story.slug === slug) ?? null
	);
}
