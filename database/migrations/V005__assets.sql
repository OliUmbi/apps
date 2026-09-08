CREATE TABLE assets.image
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site       text        NOT NULL,
    public     boolean     NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE assets.document
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug       text        NOT NULL,
    public     boolean     NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);
