CREATE TABLE jublawoma.promotion
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    link        text        NOT NULL,
    image_id    uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    starts_at   timestamptz NOT NULL,
    ends_at     timestamptz NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE jublawoma.story
(
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text        NOT NULL UNIQUE,
    title        text        NOT NULL,
    description  text        NOT NULL,
    author       text        NOT NULL,
    image_id     uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    body         text        NOT NULL,
    published    boolean     NOT NULL,
    published_on date,
    created_at   timestamptz NOT NULL,
    updated_at   timestamptz NOT NULL
);


CREATE TABLE jublawoma.story_image
(
    story_id    uuid NOT NULL REFERENCES jublawoma.story (id) ON DELETE CASCADE,
    image_id    uuid NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
    description text NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    PRIMARY KEY (story_id, image_id)
);

CREATE TABLE jublawoma.event
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    description text        NOT NULL,
    location    text        NOT NULL,
    image_id    uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    starts_on   date        NOT NULL,
    ends_on     date        NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE jublawoma.member
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text        NOT NULL,
    image_id   uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    group_name text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE jublawoma.donation
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    contact     text        NOT NULL,
    starts_at   timestamptz NOT NULL,
    ends_at     timestamptz NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE jublawoma.donation_item
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id uuid        NOT NULL REFERENCES jublawoma.donation (id) ON DELETE CASCADE,
    name        text        NOT NULL,
    description text        NOT NULL,
    quantity    numeric     NOT NULL,
    step        numeric     NOT NULL,
    unit        text        NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE jublawoma.donation_commitment
(
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id      uuid        REFERENCES jublawoma.donation (id) ON DELETE SET NULL,
    donation_item_id uuid        REFERENCES jublawoma.donation_item (id) ON DELETE SET NULL,
    donation_title   text        NOT NULL,
    item_name        text        NOT NULL,
    item_description text        NOT NULL,
    item_quantity    numeric     NOT NULL,
    step             numeric     NOT NULL,
    unit             text        NOT NULL,
    name             text        NOT NULL,
    phone            text        NOT NULL,
    quantity         numeric     NOT NULL,
    note             text,
    created_at       timestamptz NOT NULL,
    updated_at       timestamptz NOT NULL
);
