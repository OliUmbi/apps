CREATE TABLE messaging.message
(
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type      text        NOT NULL,
    sender    text        NOT NULL,
    recipient text        NOT NULL,
    subject   text        NOT NULL,
    body      text        NOT NULL,
    status    text        NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
    attempts  integer     NOT NULL,
    created   timestamptz NOT NULL,
    updated   timestamptz NOT NULL
);

CREATE INDEX ON messaging.message (created) WHERE status IN ('PENDING', 'PROCESSING');

CREATE TABLE messaging.message_attempt
(
    id         uuid PRIMARY KEY     DEFAULT gen_random_uuid(),
    message_id uuid        NOT NULL REFERENCES messaging.message (id) ON DELETE CASCADE,
    attempt    integer     NOT NULL,
    outcome    text        NOT NULL CHECK (outcome IN ('sent', 'retry', 'failed')),
    message    text,
    created    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (message_id, attempt)
);
