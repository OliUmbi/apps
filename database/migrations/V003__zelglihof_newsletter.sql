CREATE TABLE zelglihof.newsletter_subscriber (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    email_normalized text NOT NULL,
    locale text NOT NULL DEFAULT 'de-CH' CHECK (locale IN ('de-CH', 'en')),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'unsubscribed')),
    consent_source text NOT NULL,
    consent_text_version text NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT now(),
    confirmed_at timestamptz,
    unsubscribed_at timestamptz,
    last_confirmation_requested_at timestamptz NOT NULL DEFAULT now(),
    confirmation_token_hash text NOT NULL,
    confirmation_expires_at timestamptz,
    unsubscribe_token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT newsletter_subscriber_email_normalized
        CHECK (email_normalized = lower(btrim(email_normalized))),
    CONSTRAINT newsletter_subscriber_confirmation_state
        CHECK (
            (status = 'pending' AND confirmation_expires_at IS NOT NULL)
            OR (status <> 'pending')
        )
);

CREATE UNIQUE INDEX newsletter_subscriber_email_uq
    ON zelglihof.newsletter_subscriber (email_normalized);
CREATE UNIQUE INDEX newsletter_subscriber_confirmation_token_uq
    ON zelglihof.newsletter_subscriber (confirmation_token_hash);
CREATE UNIQUE INDEX newsletter_subscriber_unsubscribe_token_uq
    ON zelglihof.newsletter_subscriber (unsubscribe_token);
CREATE INDEX newsletter_subscriber_status_requested_idx
    ON zelglihof.newsletter_subscriber (status, requested_at DESC);

GRANT SELECT, INSERT, UPDATE ON zelglihof.newsletter_subscriber TO zelglihof_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON zelglihof.newsletter_subscriber TO studio_web;
