CREATE TABLE assets.image
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site       text        NOT NULL,
    public     boolean     NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE assets.image_variant
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id   uuid        NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
    size       text        NOT NULL,
    format     text        NOT NULL,
    file_key   text        NOT NULL,
    width      integer     NOT NULL,
    height     integer     NOT NULL,
    byte_count bigint      NOT NULL,
    checksum   text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    UNIQUE (image_id, size)
);

CREATE TABLE assets.document
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site       text        NOT NULL,
    public     boolean     NOT NULL,
    slug       text        NOT NULL UNIQUE,
    byte_count bigint      NOT NULL,
    checksum   text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE INDEX image_site_created_idx ON assets.image (site, created_at DESC, id DESC);
CREATE INDEX document_site_created_idx ON assets.document (site, created_at DESC, id DESC);
