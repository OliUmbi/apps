CREATE SCHEMA jublawoma;

GRANT USAGE ON SCHEMA jublawoma TO jublawoma_web, studio_web;

CREATE TABLE jublawoma.event
(
    id               uuid PRIMARY KEY,
    slug             text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    title            text        NOT NULL,
    summary          text        NOT NULL DEFAULT '',
    body_markdown    text        NOT NULL DEFAULT '',
    starts_on        date        NOT NULL,
    ends_on          date        NOT NULL,
    location         text        NOT NULL DEFAULT '',
    registration_url text,
    status           text        NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'cancelled')),
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CHECK (ends_on >= starts_on)
);

CREATE TABLE jublawoma.story
(
    id            uuid PRIMARY KEY,
    slug          text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    title         text        NOT NULL,
    summary       text        NOT NULL DEFAULT '',
    body_markdown text        NOT NULL DEFAULT '',
    status        text        NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published')),
    published_on  date,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE jublawoma.media_asset
(
    id          uuid PRIMARY KEY,
    storage_key text        NOT NULL,
    alt_text    text        NOT NULL DEFAULT '',
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (storage_key)
);

CREATE TABLE jublawoma.event_media
(
    event_id uuid    NOT NULL REFERENCES jublawoma.event (id) ON DELETE CASCADE,
    media_id uuid    NOT NULL REFERENCES jublawoma.media_asset (id) ON DELETE CASCADE,
    role     text    NOT NULL DEFAULT 'gallery' CHECK (role IN ('cover', 'gallery')),
    position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
    PRIMARY KEY (event_id, media_id)
);

CREATE UNIQUE INDEX event_single_cover_idx ON jublawoma.event_media (event_id)
    WHERE role = 'cover';

CREATE TABLE jublawoma.story_media
(
    story_id uuid    NOT NULL REFERENCES jublawoma.story (id) ON DELETE CASCADE,
    media_id uuid    NOT NULL REFERENCES jublawoma.media_asset (id) ON DELETE CASCADE,
    role     text    NOT NULL DEFAULT 'gallery' CHECK (role IN ('cover', 'gallery')),
    position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
    PRIMARY KEY (story_id, media_id)
);

CREATE UNIQUE INDEX story_single_cover_idx ON jublawoma.story_media (story_id)
    WHERE role = 'cover';
CREATE INDEX event_public_idx ON jublawoma.event (starts_on, status);
CREATE INDEX story_public_idx ON jublawoma.story (published_on DESC, status);

GRANT SELECT ON ALL TABLES IN SCHEMA jublawoma TO jublawoma_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA jublawoma TO studio_web;

INSERT INTO jublawoma.event (id, slug, title, starts_on, ends_on, location, status)
VALUES ('10000000-0000-0000-0000-000000000001', 'jubla-tag-2026', 'Jubla-Tag', '2026-09-12', '2026-09-12', 'Infos folgen', 'published'),
       ('10000000-0000-0000-0000-000000000002', 'herbstlager-2026', 'Herbstlager', '2026-09-26', '2026-10-03', 'Geheim · Anmeldung notwendig', 'published'),
       ('10000000-0000-0000-0000-000000000003', 'zrog-lueg-sunntig-2026', 'Zrog-lueg Sunntig', '2026-11-15', '2026-11-15', 'Pfarreiheim Wohlenschwil', 'published'),
       ('10000000-0000-0000-0000-000000000004', 'scharanlass-november-2026', 'Scharanlass', '2026-11-28', '2026-11-28', 'Infos folgen', 'published'),
       ('10000000-0000-0000-0000-000000000005', 'sternsingen-2027', 'Sternsingen', '2027-01-04', '2027-01-07', 'Wohlenschwil Dorf', 'published');
