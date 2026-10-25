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
    updated_at  timestamptz NOT NULL,
    CONSTRAINT promotion_window CHECK (starts_at < ends_at)
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
    image_id    uuid NOT NULL REFERENCES assets.image (id) ON DELETE CASCADE,
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
    updated_at  timestamptz NOT NULL,
    -- An open side of the window means "unbounded"; a closed window must run forward.
    CONSTRAINT product_window CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)
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
    updated_at  timestamptz NOT NULL,
    -- NULL quantity is unlimited stock; zero is a sold-out variant, never negative.
    CONSTRAINT product_variant_quantity_nonnegative CHECK (quantity IS NULL OR quantity >= 0)
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
    updated_at          timestamptz NOT NULL,
    CONSTRAINT product_reservation_status_domain CHECK (status IN ('new', 'in-progress', 'completed', 'cancelled')),
    CONSTRAINT product_reservation_quantity_positive CHECK (quantity > 0),
    CONSTRAINT product_reservation_variant_quantity_nonnegative CHECK (variant_quantity IS NULL OR variant_quantity >= 0)
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
    updated_at              timestamptz NOT NULL,
    CONSTRAINT subscriber_status_domain CHECK (status IN ('pending', 'active', 'unsubscribed'))
);

CREATE TABLE zelglihof.campaign
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject    text        NOT NULL,
    body       text        NOT NULL,
    status     text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    -- Only a draft campaign can be edited and queued for sending.
    CONSTRAINT campaign_status_domain CHECK (status IN ('draft', 'queued'))
);

CREATE TABLE zelglihof.inquiry
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status     text        NOT NULL,
    subject    text        NOT NULL,
    name       text        NOT NULL,
    phone      text        NOT NULL,
    email      text,
    message    text        NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CONSTRAINT inquiry_status_domain CHECK (status IN ('new', 'in-progress', 'completed', 'cancelled')),
    CONSTRAINT inquiry_subject_domain CHECK (subject IN ('hofladen', 'reservation', 'hof', 'other'))
);
