CREATE TABLE identity.account
(
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username      text        NOT NULL UNIQUE,
    password_hash text        NOT NULL,
    enabled       boolean     NOT NULL,
    created       timestamptz NOT NULL,
    updated       timestamptz NOT NULL
);

-- todo rethink permissions i dont think roles are necessary but the primary key is bad

CREATE Table identity.account_permission
(
    account_id uuid NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    permission text NOT NULL,
    PRIMARY KEY (account_id, permission)
);

CREATE TABLE identity.account_session
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid        NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    token_hash text        NOT NULL UNIQUE,
    created    timestamptz NOT NULL,
    expires    timestamptz NOT NULL,
    last_seen  timestamptz NOT NULL,
    revoked    timestamptz
);

CREATE INDEX ON identity.account_session (token, expires) WHERE revoked IS NULL;
