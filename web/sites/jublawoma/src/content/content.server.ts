import { publicImageUrl } from "@oliumbi/assets/urls";
import type { Page, ResourceRecord } from "@oliumbi/contracts";
import { createContentRepository } from "@oliumbi/jublawoma-data";
import type {
	EventRecord,
	MediaAsset,
	StoryRecord,
} from "@oliumbi/jublawoma-data/content.types";
import { createEventRepository } from "@oliumbi/jublawoma-data/event.repository";
import { database } from "../server/database.server";

function repository() {
	return createContentRepository(database.sql);
}
function media(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): MediaAsset[] {
	const images: MediaAsset[] = record.image_id
		? [
				{
					id: String(record.image_id),
					storageKey: publicImageUrl(String(record.image_id)),
					altText: String(record.title ?? record.name),
					role: "cover",
					position: 0,
				},
			]
		: [];
	return [
		...images,
		...children.map((image, index) => ({
			id: String(image.image_id),
			storageKey: publicImageUrl(String(image.image_id)),
			altText: String(image.description),
			role: "gallery" as const,
			position: index + 1,
		})),
	];
}
function event(record: ResourceRecord): EventRecord {
	return {
		id: String(record.id),
		title: String(record.name),
		summary: record.description ? String(record.description) : "",
		startsOn: String(record.starts_on).slice(0, 10),
		endsOn: String(record.ends_on).slice(0, 10),
		location: String(record.location),
		media: media(record),
	};
}
function story(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): StoryRecord {
	return {
		id: String(record.id),
		slug: String(record.slug),
		title: String(record.title),
		summary: String(record.description),
		bodyMarkdown: String(record.body),
		author: String(record.author),
		publishedOn: record.published_on
			? String(record.published_on).slice(0, 10)
			: null,
		media: media(record, children),
	};
}
export async function nextEvent(): Promise<EventRecord | null> {
	const record = await createEventRepository(database.sql).next();
	return record ? event(record) : null;
}
export async function publishedStories(page = 0): Promise<StoryRecord[]> {
	return (await repository().list("jublawoma.story", page)).items.map(
		(record) => story(record),
	);
}
export async function publishedStory(
	slug: string,
): Promise<StoryRecord | null> {
	const result = await repository().detail("jublawoma.story", slug, true);
	return result ? story(result.record, result.children) : null;
}
export async function eventPage(page: number): Promise<Page<EventRecord>> {
	const result = await createEventRepository(database.sql).page(page);
	return { ...result, items: result.items.map(event) };
}
export async function storyPage(page: number): Promise<Page<StoryRecord>> {
	const result = await repository().list("jublawoma.story", page);
	return { ...result, items: result.items.map((record) => story(record)) };
}
