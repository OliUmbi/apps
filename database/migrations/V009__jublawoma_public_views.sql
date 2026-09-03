CREATE VIEW jublawoma.published_event AS
SELECT id,
       slug,
       title,
       summary,
       body_markdown,
       starts_on,
       ends_on,
       location,
       registration_url
FROM jublawoma.event
WHERE status = 'published';

CREATE VIEW jublawoma.published_story AS
SELECT id, slug, title, summary, body_markdown, published_on, created_at
FROM jublawoma.story
WHERE status = 'published';

CREATE VIEW jublawoma.published_event_media AS
SELECT em.event_id, m.id, m.storage_key, m.alt_text, em.role, em.position
FROM jublawoma.event_media em
         JOIN jublawoma.event e ON e.id = em.event_id AND e.status = 'published'
         JOIN jublawoma.media_asset m ON m.id = em.media_id;

CREATE VIEW jublawoma.published_story_media AS
SELECT sm.story_id, m.id, m.storage_key, m.alt_text, sm.role, sm.position
FROM jublawoma.story_media sm
         JOIN jublawoma.story s ON s.id = sm.story_id AND s.status = 'published'
         JOIN jublawoma.media_asset m ON m.id = sm.media_id;

REVOKE SELECT ON jublawoma.event, jublawoma.story, jublawoma.media_asset,
    jublawoma.event_media, jublawoma.story_media FROM jublawoma_web;
GRANT SELECT ON jublawoma.published_event, jublawoma.published_story,
    jublawoma.published_event_media, jublawoma.published_story_media TO jublawoma_web;
