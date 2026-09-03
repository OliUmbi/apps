import { randomUUID } from "node:crypto";
import type { Transaction } from "@oliumbi/database";
import { database } from "../../server/database.server";
import type {
	EventInput,
	ManagedEvent,
	ManagedStory,
	MediaInput,
	StoryInput,
} from "./content.types";

function mediaJson(join: "em" | "sm") {
	return `coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'storageKey', m.storage_key, 'altText', m.alt_text, 'role', ${join}.role, 'position', ${join}.position) order by case ${join}.role when 'cover' then 0 else 1 end, ${join}.position) filter (where m.id is not null), '[]'::jsonb)`;
}

export function listManagedEvents(): Promise<ManagedEvent[]> {
	return database.sql.unsafe<ManagedEvent[]>(
		`select e.id, e.slug, e.title, e.summary, e.body_markdown as "bodyMarkdown", e.starts_on::text as "startsOn", e.ends_on::text as "endsOn", e.location, e.registration_url as "registrationUrl", e.status, ${mediaJson("em")} as media from jublawoma.event e left join jublawoma.event_media em on em.event_id=e.id left join jublawoma.media_asset m on m.id=em.media_id group by e.id order by e.starts_on desc`,
	);
}

export function listManagedStories(): Promise<ManagedStory[]> {
	return database.sql.unsafe<ManagedStory[]>(
		`select s.id, s.slug, s.title, s.summary, s.body_markdown as "bodyMarkdown", s.published_on::text as "publishedOn", s.status, ${mediaJson("sm")} as media from jublawoma.story s left join jublawoma.story_media sm on sm.story_id=s.id left join jublawoma.media_asset m on m.id=sm.media_id group by s.id order by s.published_on desc nulls last, s.created_at desc`,
	);
}

export async function upsertEventWithMedia(
	id: string,
	input: EventInput,
	now: Date,
) {
	await database.transaction(async (sql) => {
		await upsertEvent(sql, id, input, now);
		await replaceMedia(sql, { type: "event", id }, input.media, now);
	});
}

export async function upsertStoryWithMedia(
	id: string,
	input: StoryInput,
	now: Date,
) {
	await database.transaction(async (sql) => {
		await upsertStory(sql, id, input, now);
		await replaceMedia(sql, { type: "story", id }, input.media, now);
	});
}

async function upsertEvent(
	sql: Transaction,
	id: string,
	input: EventInput,
	now: Date,
) {
	await sql`insert into jublawoma.event (id, slug, title, summary, body_markdown, starts_on, ends_on, location, registration_url, status, created_at, updated_at)
		values (${id}, ${input.slug}, ${input.title}, ${input.summary}, ${input.bodyMarkdown}, ${input.startsOn}, ${input.endsOn}, ${input.location}, ${input.registrationUrl || null}, ${input.status}, ${now}, ${now})
		on conflict (id) do update set slug=excluded.slug, title=excluded.title, summary=excluded.summary, body_markdown=excluded.body_markdown, starts_on=excluded.starts_on, ends_on=excluded.ends_on, location=excluded.location, registration_url=excluded.registration_url, status=excluded.status, updated_at=${now}`;
}

async function upsertStory(
	sql: Transaction,
	id: string,
	input: StoryInput,
	now: Date,
) {
	await sql`insert into jublawoma.story (id, slug, title, summary, body_markdown, published_on, status, created_at, updated_at)
		values (${id}, ${input.slug}, ${input.title}, ${input.summary}, ${input.bodyMarkdown}, ${input.publishedOn || null}, ${input.status}, ${now}, ${now})
		on conflict (id) do update set slug=excluded.slug, title=excluded.title, summary=excluded.summary, body_markdown=excluded.body_markdown, published_on=excluded.published_on, status=excluded.status, updated_at=${now}`;
}

async function replaceMedia(
	sql: Transaction,
	owner: { type: "event" | "story"; id: string },
	media: MediaInput[],
	now: Date,
) {
	const joinTable = owner.type === "event" ? "event_media" : "story_media";
	const ownerColumn = owner.type === "event" ? "event_id" : "story_id";
	await sql.unsafe(
		`delete from jublawoma.${joinTable} where ${ownerColumn} = $1`,
		[owner.id],
	);
	for (const item of media) {
		const mediaId = await upsertMediaAsset(sql, item, now);
		await attachMedia(sql, joinTable, ownerColumn, owner.id, mediaId, item);
	}
}

async function upsertMediaAsset(sql: Transaction, item: MediaInput, now: Date) {
	const rows = await sql<{ id: string }[]>`
		insert into jublawoma.media_asset (id, storage_key, alt_text, created_at)
		values (${randomUUID()}, ${item.storageKey}, ${item.altText}, ${now})
		on conflict (storage_key) do update set alt_text = excluded.alt_text
		returning id
	`;
	const asset = rows[0];
	if (!asset) throw new Error("Media asset could not be saved");
	return asset.id;
}

async function attachMedia(
	sql: Transaction,
	joinTable: "event_media" | "story_media",
	ownerColumn: "event_id" | "story_id",
	ownerId: string,
	mediaId: string,
	item: MediaInput,
) {
	await sql.unsafe(
		`insert into jublawoma.${joinTable} (${ownerColumn}, media_id, role, position) values ($1, $2, $3, $4)`,
		[ownerId, mediaId, item.role, item.position],
	);
}
