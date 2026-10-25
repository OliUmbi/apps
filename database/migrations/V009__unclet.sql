CREATE TABLE unclet.showcase
(
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text        NOT NULL UNIQUE,
    title        text        NOT NULL,
    location     text        NOT NULL,
    guest_count  integer     NOT NULL,
    image_id     uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    published    boolean     NOT NULL,
    published_on date,
    body         text,
    created_at   timestamptz NOT NULL,
    updated_at   timestamptz NOT NULL
);

CREATE TABLE unclet.showcase_image
(
    showcase_id uuid NOT NULL REFERENCES unclet.showcase (id) ON DELETE CASCADE,
    image_id    uuid NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
    description text NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    PRIMARY KEY (showcase_id, image_id)
);

CREATE TABLE unclet.review
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stars       integer     NOT NULL,
    name        text        NOT NULL,
    description text        NOT NULL,
    visible     boolean     NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    -- Reviews are a five-star scale; moderation is the visible flag.
    CONSTRAINT review_stars_range CHECK (stars BETWEEN 1 AND 5)
);

CREATE TABLE unclet.inquiry
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status      text        NOT NULL,
    name        text        NOT NULL,
    email       text        NOT NULL,
    phone       text        NOT NULL,
    event_on    date,
    location    text,
    guest_count integer,
    note        text,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    CONSTRAINT inquiry_status_domain CHECK (status IN ('new', 'in-progress', 'completed', 'cancelled'))
);
