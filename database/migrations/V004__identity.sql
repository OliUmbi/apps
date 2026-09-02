CREATE TABLE identity.account (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT identity_account_username_normalized
        CHECK (username = lower(btrim(username)))
);

CREATE UNIQUE INDEX identity_account_username_uq
    ON identity.account (username);

CREATE TABLE identity.session (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash text NOT NULL UNIQUE,
    account_id uuid NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz
);

CREATE INDEX identity_session_active_idx
    ON identity.session (token_hash, expires_at)
    WHERE revoked_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA identity TO identity_service;
