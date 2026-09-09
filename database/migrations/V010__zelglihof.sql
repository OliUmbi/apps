CREATE TABLE zelglihof.promotion
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

CREATE TABLE zelglihof.article
(
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text        NOT NULL UNIQUE,
    title        text        NOT NULL,
    description  text        NOT NULL,
    image_id     uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    body         text        NOT NULL,
    published    boolean     NOT NULL,
    published_on date,
    created_at   timestamptz NOT NULL,
    updated_at   timestamptz NOT NULL
);

CREATE TABLE zelglihof.article_image
(
    article_id  uuid NOT NULL REFERENCES zelglihof.article (id) ON DELETE CASCADE,
    image_id    uuid NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    description text NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    PRIMARY KEY (article_id, image_id)
);

CREATE TABLE zelglihof.product
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    description text        NOT NULL,
    body        text        NOT NULL,
    image_id    uuid        NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    visible     boolean     NOT NULL,
    reservable  boolean     NOT NULL,
    starts_at   timestamptz,
    ends_at     timestamptz,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE zelglihof.product_variant
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  uuid        NOT NULL REFERENCES zelglihof.product (id) ON DELETE CASCADE,
    name        text        NOT NULL,
    description text,
    image_id    uuid NULL REFERENCES assets.image (id) ON DELETE SET NULL,
    price       text        NOT NULL,
    quantity    integer,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
);

CREATE TABLE zelglihof.product_reservation
(
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          uuid        REFERENCES zelglihof.product (id) ON DELETE SET NULL,
    product_variant_id  uuid        REFERENCES zelglihof.product_variant (id) ON DELETE SET NULL,
    product_name        text        NOT NULL,
    variant_name        text        NOT NULL,
    variant_description text,
    variant_quantity    integer,
    variant_price          text        NOT NULL,
    name                text        NOT NULL,
    phone               text        NOT NULL,
    email               text,
    quantity            integer     NOT NULL,
    note                text,
    status              text        NOT NULL,
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL
);

CREATE TABLE zelglihof.subscriber
(
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   text        NOT NULL UNIQUE,
    status                  text        NOT NULL,
    requested_at            timestamptz NOT NULL,
    confirmed_at            timestamptz,
    unsubscribed_at         timestamptz,
    confirmation_token_hash text        NOT NULL UNIQUE,
    unsubscribe_token       text        NOT NULL UNIQUE,
    created_at              timestamptz NOT NULL,
    updated_at              timestamptz NOT NULL
);

CREATE TABLE zelglihof.campaign
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject    text        NOT NULL,
    body       text        NOT NULL,
    status     text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE zelglihof.inquiry
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status     text        NOT NULL,
    name       text        NOT NULL,
    phone      text        NOT NULL,
    email      text,
    message    text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);
