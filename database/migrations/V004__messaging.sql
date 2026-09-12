CREATE TABLE messaging.message
(
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id      uuid        NOT NULL UNIQUE,
    site          text        NOT NULL,
    type          text        NOT NULL,
    sender        text        NOT NULL,
    recipient     text        NOT NULL,
    subject       text        NOT NULL,
    text          text        NOT NULL,
    html          text,
    status        text        NOT NULL,
    attempt_count integer     NOT NULL CHECK (attempt_count >= 0),
    available_at  timestamptz,
    locked_at     timestamptz,
    requested_at  timestamptz NOT NULL,
    finished_at   timestamptz,
    created_at    timestamptz NOT NULL,
    updated_at    timestamptz NOT NULL,
    CHECK (
        (status = 'PENDING' AND available_at IS NOT NULL AND locked_at IS NULL AND finished_at IS NULL) OR
        (status = 'PROCESSING' AND attempt_count > 0 AND available_at IS NULL AND locked_at IS NOT NULL AND
         finished_at IS NULL) OR
        (status IN ('SENT', 'FAILED') AND attempt_count > 0 AND available_at IS NULL AND locked_at IS NULL AND
         finished_at IS NOT NULL)
        )
);

CREATE TABLE messaging.message_attempt
(
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id     uuid        NOT NULL REFERENCES messaging.message (id) ON DELETE CASCADE,
    attempt_number integer     NOT NULL CHECK (attempt_number > 0),
    outcome        text,
    detail         jsonb,
    started_at     timestamptz NOT NULL,
    finished_at    timestamptz,
    created_at     timestamptz NOT NULL,
    updated_at     timestamptz NOT NULL,
    UNIQUE (message_id, attempt_number),
    CHECK (
        (outcome IS NULL AND finished_at IS NULL AND detail IS NULL) OR
        (outcome IS NOT NULL AND finished_at IS NOT NULL AND (
            (outcome = 'SENT' AND detail IS NULL) OR
            (outcome IN ('RETRY', 'FAILED', 'ABANDONED', 'REJECTED') AND detail IS NOT NULL)
            ))
        )
);

CREATE INDEX messaging_message_pending_idx ON messaging.message (available_at, created_at, id) WHERE status = 'PENDING';
CREATE INDEX messaging_message_processing_idx ON messaging.message (locked_at) WHERE status = 'PROCESSING';
