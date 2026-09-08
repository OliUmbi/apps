CREATE TABLE messaging.message_attempt
(
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id     uuid        NOT NULL REFERENCES queue.message (id) ON DELETE CASCADE,
    attempt_number integer     NOT NULL,
    outcome        text,
    message        text,
    started_at     timestamptz NOT NULL,
    finished_at    timestamptz,
    UNIQUE (message_id, attempt_number)
);
