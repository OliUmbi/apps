CREATE SCHEMA unclet;

GRANT USAGE ON SCHEMA unclet TO unclet_web, studio_web;
GRANT USAGE ON SCHEMA messaging TO unclet_web;

CREATE TABLE unclet.inquiry
(
    id            uuid PRIMARY KEY,
    customer_name text        NOT NULL,
    email         text,
    phone         text,
    event_date    date,
    location      text        NOT NULL,
    guest_count   integer     NOT NULL CHECK (guest_count > 0 AND guest_count <= 10000),
    note          text,
    status        text        NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'closed', 'declined')),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inquiry_contact_required CHECK (
        nullif(btrim(email), '') IS NOT NULL OR nullif(btrim(phone), '') IS NOT NULL
        )
);

CREATE INDEX inquiry_status_created_idx
    ON unclet.inquiry (status, created_at DESC);
CREATE INDEX inquiry_event_date_idx
    ON unclet.inquiry (event_date)
    WHERE event_date IS NOT NULL AND status NOT IN ('closed', 'declined');

GRANT INSERT ON unclet.inquiry TO unclet_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON unclet.inquiry TO studio_web;
