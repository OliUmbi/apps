CREATE TABLE identity.account
(
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text        NOT NULL UNIQUE,
    email         text        NOT NULL UNIQUE,
    password_hash text        NOT NULL,
    enabled       boolean     NOT NULL,
    created_at    timestamptz NOT NULL,
    updated_at    timestamptz NOT NULL
);

CREATE TABLE identity.account_permission
(
    account_id uuid        NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    permission text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    PRIMARY KEY (account_id, permission)
);

CREATE TABLE identity.account_session
(
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id   uuid        NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    token_hash   text        NOT NULL UNIQUE,
    expires_at   timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL,
    revoked_at   timestamptz,
    created_at   timestamptz NOT NULL,
    updated_at   timestamptz NOT NULL
);

-- The session table only grows: account delete cascades and the expiry purge
-- both filter on these columns (RS-E3).
CREATE INDEX account_session_account_id_idx ON identity.account_session (account_id);
CREATE INDEX account_session_expires_at_idx ON identity.account_session (expires_at);
