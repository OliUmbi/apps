CREATE TABLE zelglihof.outgoing_message
(
    id              uuid PRIMARY KEY,
    message_type    text        NOT NULL,
    recipient_email text        NOT NULL,
    locale          text        NOT NULL CHECK (locale IN ('de-CH', 'en')),
    payload         jsonb       NOT NULL,
    correlation_key text,
    attempt_count   integer     NOT NULL CHECK (attempt_count >= 0),
    available_at    timestamptz NOT NULL,
    last_error      text,
    created_at      timestamptz NOT NULL,
    updated_at      timestamptz NOT NULL
);

CREATE INDEX zelglihof_outgoing_message_due_idx
    ON zelglihof.outgoing_message (available_at, created_at);

CREATE TABLE unclet.outgoing_message
(
    id              uuid PRIMARY KEY,
    message_type    text        NOT NULL,
    recipient_email text        NOT NULL,
    locale          text        NOT NULL CHECK (locale IN ('de-CH', 'en')),
    payload         jsonb       NOT NULL,
    correlation_key text,
    attempt_count   integer     NOT NULL CHECK (attempt_count >= 0),
    available_at    timestamptz NOT NULL,
    last_error      text,
    created_at      timestamptz NOT NULL,
    updated_at      timestamptz NOT NULL
);

CREATE INDEX unclet_outgoing_message_due_idx
    ON unclet.outgoing_message (available_at, created_at);

CREATE TABLE messaging.correlation_tombstone
(
    correlation_key text PRIMARY KEY,
    created_at      timestamptz NOT NULL
);

ALTER TABLE messaging.outbox
    DROP CONSTRAINT outbox_status_check,
    ADD CONSTRAINT outbox_status_check
        CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'scrubbed'));

GRANT SELECT, INSERT ON messaging.correlation_tombstone TO messaging_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON zelglihof.outgoing_message TO zelglihof_web, studio_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON unclet.outgoing_message TO unclet_web, studio_web;

REVOKE INSERT ON messaging.outbox FROM zelglihof_web, unclet_web, studio_web;
REVOKE USAGE ON SCHEMA messaging FROM zelglihof_web, unclet_web, studio_web;
