CREATE TABLE jublawoma.promotion
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    link        text        NOT NULL,
    image_id    uuid        NOT NULL,
    start       timestamptz NOT NULL,
    finish      timestamptz NOT NULL,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE jublawoma.article
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    author      text        NOT NULL,
    image_id    uuid        NOT NULL,
    body        text        NOT NULL,
    published   date,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE jublawoma.article_image
(
    article_id  uuid NOT NULL REFERENCES jublawoma.article (id) ON DELETE CASCADE,
    image_id    uuid NOT NULL,
    descrîption text NOT NULL,
    PRIMARY KEY (article_id, image_id)
);

CREATE TABLE jublawoma.event
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    description text        NOT NULL,
    location    text        NOT NULL,
    image_id    uuid        NOT NULL,
    start       timestamptz NOT NULL,
    finish      timestamptz NOT NULL,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE jublawoma.member
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text        NOT NULL,
    image_id   uuid        NOT NULL,
    kids_group text        NOT NULL,
    created    timestamptz NOT NULL,
    updated    timestamptz NOT NULL
);

CREATE TABLE jublawoma.donation
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    contact     text        NOT NULL,
    start       timestamptz NOT NULL,
    finish      timestamptz NOT NULL,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE jublawoma.donation_product
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id uuid          NOT NULL REFERENCES jublawoma.donation (id) ON DELETE CASCADE,
    name        text          NOT NULL,
    description text          NOT NULL,
    quantity    decimal(6, 2) NOT NULL,
    step        decimal(6, 2) NOT NULL,
    unit        text          NOT NULL,
    created     timestamptz   NOT NULL,
    updated     timestamptz   NOT NULL
);

CREATE TABLE jublawoma.donation_product_donor
(
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_product_id uuid          NOT NULL REFERENCES jublawoma.donation_product (id) ON DELETE CASCADE,
    name                text          NOT NULL,
    phone               text          NOT NULL,
    quantity            decimal(6, 2) NOT NULL,
    note                text,
    created             timestamptz   NOT NULL,
    updated             timestamptz   NOT NULL
);
