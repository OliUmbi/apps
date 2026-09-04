
CREATE TABLE zelglihof.promotion
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

CREATE TABLE zelglihof.article
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    image_id    uuid        NOT NULL,
    body        text        NOT NULL,
    published   date,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE zelglihof.article_image
(
    article_id  uuid NOT NULL REFERENCES jublawoma.article (id) ON DELETE CASCADE,
    image_id    uuid NOT NULL,
    descrîption text NOT NULL,
    PRIMARY KEY (article_id, image_id)
);

CREATE TABLE zelglihof.product
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    description text        NOT NULL,
    body        text        NOT NULL,
    image_id    uuid        NOT NULL,
    start       timestamptz,
    finish      timestamptz,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

-- todo review how variants will work and what happens when only one exists
CREATE TABLE zelglihof.product_variant
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  uuid          NOT NULL REFERENCES zelglihof.product (id) ON DELETE CASCADE,
    name        text          NOT NULL,
    description text,
    image_id    uuid,
    price       decimal(6, 2) NOT NULL,
    quantity    integer,
    created     timestamptz   NOT NULL,
    updated     timestamptz   NOT NULL
);

CREATE TABLE zelglihof.product_variant_reservation
(
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id uuid        NOT NULL REFERENCES zelglihof.product_variant (id) ON DELETE CASCADE,
    name               text        NOT NULL,
    phone              text        NOT NULL,
    email              text,
    quantity           integer     NOT NULL,
    note               text,
    status             text        NOT NULL,
    created            timestamptz NOT NULL,
    updated            timestamptz NOT NULL
);

-- todo review where hashing makes sense
CREATE TABLE zelglihof.subscriber
(
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   text        NOT NULL UNIQUE,
    status                  text        NOT NULL,
    requested               timestamptz NOT NULL,
    confirmed               timestamptz,
    unsubscribed            timestamptz,
    confirmation_token_hash text        NOT NULL,
    unsubscribe_token       text        NOT NULL,
    created                 timestamptz NOT NULL,
    updated                 timestamptz NOT NULL
);

-- todo a newsletter campaign will be sent only once and if it fails needs review by site administrator to prevent spam
CREATE TABLE zelglihof.newsletter
(
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text        NOT NULL,
    body    text        NOT NULL,
    status  text        NOT NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL
);

CREATE TABLE zelglihof.inquiry
(
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status  text        NOT NULL,
    name    text        NOT NULL,
    phone   text        NOT NULL,
    email   text,
    message text        NOT NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL
);

-- todo review message sending and retry
