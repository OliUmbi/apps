import { database } from "../server/database.server";
import type { EventRecord, StoryRecord } from "./types";

export function findPublishedEvents(): Promise<EventRecord[]> {
	return database.sql<EventRecord[]>`
		select e.id, e.slug, e.title, e.summary, e.body_markdown as "bodyMarkdown",
			e.starts_on::text as "startsOn", e.ends_on::text as "endsOn",
			e.location, e.registration_url as "registrationUrl",
			coalesce(jsonb_agg(jsonb_build_object(
				'id', em.id, 'storageKey', em.storage_key, 'altText', em.alt_text,
				'role', em.role, 'position', em.position
			) order by case em.role when 'cover' then 0 else 1 end, em.position)
			filter (where em.id is not null), '[]'::jsonb) as media
		from jublawoma.published_event e
		left join jublawoma.published_event_media em on em.event_id = e.id
		group by e.id, e.slug, e.title, e.summary, e.body_markdown, e.starts_on, e.ends_on, e.location, e.registration_url
		order by e.starts_on
	`;
}

export function findPublishedStories(): Promise<StoryRecord[]> {
	return database.sql<StoryRecord[]>`
		select s.id, s.slug, s.title, s.summary, s.body_markdown as "bodyMarkdown",
			s.published_on::text as "publishedOn",
			coalesce(jsonb_agg(jsonb_build_object(
				'id', sm.id, 'storageKey', sm.storage_key, 'altText', sm.alt_text,
				'role', sm.role, 'position', sm.position
			) order by case sm.role when 'cover' then 0 else 1 end, sm.position)
			filter (where sm.id is not null), '[]'::jsonb) as media
		from jublawoma.published_story s
		left join jublawoma.published_story_media sm on sm.story_id = s.id
		group by s.id, s.slug, s.title, s.summary, s.body_markdown, s.published_on, s.created_at
		order by s.published_on desc nulls last, s.created_at desc
	`;
}
