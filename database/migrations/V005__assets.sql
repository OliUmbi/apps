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
    image_id   uuid NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
    size       text NOT NULL CHECK (size IN ('MASTER', 'XS', 'SM', 'MD', 'LG', 'XL', 'XXL')),
    format     text NOT NULL CHECK (format IN ('JPEG', 'PNG')),
    file_key   text NOT NULL,
    width      integer NOT NULL CHECK (width > 0),
    height     integer NOT NULL CHECK (height > 0),
    byte_count bigint NOT NULL CHECK (byte_count > 0),
    checksum   text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    UNIQUE (image_id, size)
);

CREATE TABLE assets.document
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site       text NOT NULL,
    public     boolean NOT NULL,
    slug       text NOT NULL UNIQUE,
    filename   text NOT NULL,
    byte_count bigint NOT NULL CHECK (byte_count > 0),
    checksum   text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE INDEX image_site_created_idx ON assets.image (site, created_at DESC, id DESC);
CREATE INDEX document_site_created_idx ON assets.document (site, created_at DESC, id DESC);