import { randomUUID } from "node:crypto";
import { requireActor } from "../../server/auth.server";
import {
	listManagedEvents,
	listManagedStories,
	upsertEventWithMedia,
	upsertStoryWithMedia,
} from "./content.repository";
import type { EventInput, StoryInput } from "./content.types";

export type {
	EventInput,
	ManagedEvent,
	ManagedMedia,
	ManagedStory,
	MediaInput,
	StoryInput,
} from "./content.types";

export async function jublawomaOverview() {
	await requireActor();
	const [events, stories] = await Promise.all([
		listManagedEvents(),
		listManagedStories(),
	]);
	return { events, stories };
}

export async function saveEvent(input: EventInput) {
	await requireActor();
	await upsertEventWithMedia(input.id ?? randomUUID(), input, new Date());
}

export async function saveStory(input: StoryInput) {
	await requireActor();
	await upsertStoryWithMedia(input.id ?? randomUUID(), input, new Date());
}
