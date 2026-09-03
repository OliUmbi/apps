CREATE TABLE messaging.outbox
(
    id              uuid PRIMARY KEY     DEFAULT gen_random_uuid(),
    message_type    text        NOT NULL,
    recipient_email text        NOT NULL,
    locale          text        NOT NULL DEFAULT 'de-CH',
    payload         jsonb       NOT NULL,
    correlation_key text,
    status          text        NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempt_count   integer     NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    available_at    timestamptz NOT NULL DEFAULT now(),
    locked_at       timestamptz,
    sent_at         timestamptz,
    last_error      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX outbox_claim_idx
    ON messaging.outbox (available_at, created_at)
    WHERE status IN ('pending', 'processing');

CREATE INDEX outbox_correlation_idx
    ON messaging.outbox (correlation_key)
    WHERE correlation_key IS NOT NULL;

CREATE TABLE messaging.delivery_attempt
(
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    outbox_id      uuid        NOT NULL REFERENCES messaging.outbox (id) ON DELETE CASCADE,
    attempt_number integer     NOT NULL,
    outcome        text        NOT NULL CHECK (outcome IN ('sent', 'retry', 'failed')),
    error_message  text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (outbox_id, attempt_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA messaging TO messaging_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA messaging TO messaging_service;
GRANT INSERT ON messaging.outbox TO zelglihof_web, studio_web;
