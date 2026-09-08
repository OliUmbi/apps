CREATE TABLE queue.message
(
    id              uuid PRIMARY KEY     DEFAULT gen_random_uuid(),
    site            text        NOT NULL,
    idempotency_key uuid        NOT NULL,
    type            text        NOT NULL,
    sender          text        NOT NULL,
    recipient       text        NOT NULL,
    subject         text        NOT NULL,
    text            text        NOT NULL,
    html            text,
    status          text        NOT NULL,
    attempt_count   integer     NOT NULL,
    available_at    timestamptz NOT NULL, -- Earliest next attempt.
    locked_at       timestamptz,          -- Detect abandoned processing; attempt_count identifies the claim.
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (site, idempotency_key)
);
