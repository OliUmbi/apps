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
    account_id uuid NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    permission text NOT NULL,
    PRIMARY KEY (account_id, permission)
);

-- todo think where to store all available permissions (maybe hardcoded somewhere or dynamically found)

CREATE TABLE identity.account_session
(
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id   uuid        NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    token_hash   text        NOT NULL UNIQUE,
    expires_at   timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL,
    revoked_at   timestamptz,
    created_at   timestamptz NOT NULL
);
