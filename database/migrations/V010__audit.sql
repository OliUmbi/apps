-- Append-only history for destructive and administrative Studio actions.
-- Deliberately no foreign keys: the history must survive deletion of the
-- account or record it names. The studio role may insert and read, never
-- update or delete; housekeeping runs as the migrating role.
CREATE TABLE studio.audit_event
(
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    site       text,
    actor_id   uuid,
    actor_name text        NOT NULL,
    action     text        NOT NULL,
    entity     text        NOT NULL,
    entity_id  text,
    summary    text
);

CREATE INDEX audit_event_created_at_idx ON studio.audit_event (created_at DESC);
CREATE INDEX audit_event_site_created_at_idx ON studio.audit_event (site, created_at DESC);
CREATE INDEX audit_event_actor_created_at_idx ON studio.audit_event (actor_id, created_at DESC);

-- V001 grants the studio role SELECT, INSERT, UPDATE and DELETE on tables
-- created in the studio schema. The audit trail is append-only for the app.
REVOKE UPDATE, DELETE ON studio.audit_event FROM studio;
