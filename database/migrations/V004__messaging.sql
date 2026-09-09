-- todo i think the id should be independent and there should be an explicit reference to the old queue entry if at all since it is deleted anyway
-- todo is failure_code and failure_message needed since it should already be in message_attempt
CREATE TABLE messaging.message
(
    id              uuid PRIMARY KEY, -- The original queue.message ID; the inbox row is consumed.
    site            text        NOT NULL,
    type            text        NOT NULL,
    sender          text        NOT NULL,
    recipient       text        NOT NULL,
    subject         text        NOT NULL,
    text            text        NOT NULL,
    html            text,
    status          text        NOT NULL,
    attempt_count   integer     NOT NULL,
    available_at    timestamptz NOT NULL,
    locked_at       timestamptz,
    requested_at    timestamptz NOT NULL,
    finished_at     timestamptz,
    failure_code    text,
    failure_message text,
    created_at      timestamptz NOT NULL,
    updated_at      timestamptz NOT NULL
);

-- todo shouldn't message and failure_code be merged into one (something like detail)
CREATE TABLE messaging.message_attempt
(
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id     uuid        NOT NULL REFERENCES messaging.message (id) ON DELETE CASCADE,
    attempt_number integer     NOT NULL,
    outcome        text,
    message        text,
    failure_code   text,
    started_at     timestamptz NOT NULL,
    finished_at    timestamptz,
    created_at     timestamptz NOT NULL,
    updated_at     timestamptz NOT NULL,
    UNIQUE (message_id, attempt_number)
);

-- todo again dont dislike the index per se but the structure is not finished for now
CREATE INDEX messaging_message_pending_idx ON messaging.message (available_at, created_at, id)
    WHERE status = 'pending';
CREATE INDEX messaging_message_processing_idx ON messaging.message (locked_at)
    WHERE status = 'processing';
CREATE INDEX messaging_message_history_idx ON messaging.message (created_at DESC, id DESC);
