CREATE TABLE zelglihof.product
(
    id         text PRIMARY KEY,
    name       text        NOT NULL,
    active     boolean     NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE zelglihof.product_variant
(
    id             text PRIMARY KEY,
    product_id     text        NOT NULL REFERENCES zelglihof.product (id),
    name           text        NOT NULL,
    stock_quantity integer     NOT NULL CHECK (stock_quantity >= 0),
    active         boolean     NOT NULL DEFAULT true,
    sort_order     integer     NOT NULL DEFAULT 0,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_variant_product_sort_idx
    ON zelglihof.product_variant (product_id, sort_order);

CREATE TABLE zelglihof.reservation
(
    id            uuid PRIMARY KEY     DEFAULT gen_random_uuid(),
    product_id    text        NOT NULL REFERENCES zelglihof.product (id),
    variant_id    text        NOT NULL REFERENCES zelglihof.product_variant (id),
    customer_name text        NOT NULL,
    email         text,
    phone         text,
    quantity      integer     NOT NULL CHECK (quantity > 0),
    note          text,
    status        text        NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'confirmed', 'ready', 'collected', 'cancelled')),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reservation_contact_required CHECK (
        nullif(btrim(email), '') IS NOT NULL OR nullif(btrim(phone), '') IS NOT NULL
        )
);

CREATE INDEX reservation_status_created_idx
    ON zelglihof.reservation (status, created_at DESC);
CREATE INDEX reservation_product_created_idx
    ON zelglihof.reservation (product_id, created_at DESC);

CREATE TABLE zelglihof.contact_inquiry
(
    id            uuid PRIMARY KEY     DEFAULT gen_random_uuid(),
    customer_name text        NOT NULL,
    email         text,
    phone         text,
    subject       text        NOT NULL,
    message       text        NOT NULL,
    status        text        NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'answered', 'archived')),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT contact_inquiry_contact_required CHECK (
        nullif(btrim(email), '') IS NOT NULL OR nullif(btrim(phone), '') IS NOT NULL
        )
);

CREATE INDEX contact_inquiry_status_created_idx
    ON zelglihof.contact_inquiry (status, created_at DESC);

INSERT INTO zelglihof.product (id, name, active)
VALUES ('rindfleisch', 'Mägenwiler Beef', true),
       ('eier', 'Frische Eier', true),
       ('zuckermais', 'Zuckermais', false),
       ('bohnen', 'Grüne Bohnen', false);

INSERT INTO zelglihof.product_variant (id, product_id, name, stock_quantity, sort_order)
VALUES ('rindfleisch-5kg', 'rindfleisch', 'Mischpaket · ca. 5 kg', 10, 10),
       ('rindfleisch-10kg', 'rindfleisch', 'Mischpaket · ca. 10 kg', 6, 20),
       ('rindfleisch-15kg', 'rindfleisch', 'Familienpaket · ca. 15 kg', 3, 30),
       ('eier-6', 'eier', '6er-Schachtel', 50, 10),
       ('eier-10', 'eier', '10er-Schachtel', 30, 20),
       ('eier-30', 'eier', '30er-Lage', 10, 30),
       ('zuckermais-1', 'zuckermais', 'Einzelner Kolben', 0, 10),
       ('zuckermais-5', 'zuckermais', 'Bund à 5 Kolben', 0, 20),
       ('bohnen-500g', 'bohnen', '500 g', 0, 10),
       ('bohnen-1kg', 'bohnen', '1 kg', 0, 20);

GRANT SELECT ON zelglihof.product, zelglihof.product_variant TO zelglihof_web;
GRANT INSERT ON zelglihof.reservation, zelglihof.contact_inquiry TO zelglihof_web;
GRANT UPDATE (stock_quantity, updated_at) ON zelglihof.product_variant TO zelglihof_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON
    zelglihof.product, zelglihof.product_variant,
    zelglihof.reservation, zelglihof.contact_inquiry
    TO studio_web;
