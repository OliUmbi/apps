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
    updated_at  timestamptz NOT NULL,
    CONSTRAINT promotion_window CHECK (starts_at < ends_at)
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
    story_id    uuid        NOT NULL REFERENCES jublawoma.story (id) ON DELETE CASCADE,
    image_id    uuid        NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
    description text        NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    PRIMARY KEY (story_id, image_id)
);

CREATE TABLE jublawoma.event
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    description text,
    location    text        NOT NULL,
    image_id    uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    starts_on   date        NOT NULL,
    ends_on     date        NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    -- Single-day events are legitimate (starts_on = ends_on).
    CONSTRAINT event_period CHECK (starts_on <= ends_on)
);

CREATE TABLE jublawoma.member
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text        NOT NULL,
    leadership boolean     NOT NULL,
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
    updated_at  timestamptz NOT NULL,
    CONSTRAINT donation_window CHECK (starts_at < ends_at)
);

CREATE TABLE jublawoma.donation_item
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id uuid        NOT NULL REFERENCES jublawoma.donation (id) ON DELETE CASCADE,
    name        text        NOT NULL,
    detail      text,
    quantity    numeric     NOT NULL,
    step        numeric     NOT NULL,
    unit        text        NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    -- Quantities and steps are exact numerics; only positive values are sellable.
    CONSTRAINT donation_item_quantity_positive CHECK (quantity > 0),
    CONSTRAINT donation_item_step_positive CHECK (step > 0)
);

CREATE TABLE jublawoma.donation_commitment
(
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id      uuid        REFERENCES jublawoma.donation (id) ON DELETE SET NULL,
    donation_item_id uuid        REFERENCES jublawoma.donation_item (id) ON DELETE SET NULL,
    donation_title   text        NOT NULL,
    item_name        text        NOT NULL,
    item_detail      text,
    item_quantity    numeric     NOT NULL,
    step             numeric     NOT NULL,
    unit             text        NOT NULL,
    name             text        NOT NULL,
    phone            text        NOT NULL,
    quantity         numeric     NOT NULL,
    note             text,
    created_at       timestamptz NOT NULL,
    updated_at       timestamptz NOT NULL,
    -- A commitment always carries positive snapshots and a positive quantity.
    CONSTRAINT donation_commitment_item_quantity_positive CHECK (item_quantity > 0),
    CONSTRAINT donation_commitment_step_positive CHECK (step > 0),
    CONSTRAINT donation_commitment_quantity_positive CHECK (quantity > 0)
);
