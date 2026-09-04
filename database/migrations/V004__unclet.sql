CREATE TABLE unclet.article
(
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title     text        NOT NULL,
    location  text        NOT NULL,
    guests    integer     NOT NULL,
    image_id  uuid        NOT NULL,
    body      text,
    published date,
    created   timestamptz NOT NULL,
    updated   timestamptz NOT NULL
);

CREATE TABLE unclet.article_image
(
    article_id  uuid NOT NULL REFERENCES jublawoma.article (id) ON DELETE CASCADE,
    image_id    uuid NOT NULL,
    descrîption text NOT NULL,
    PRIMARY KEY (article_id, image_id)
);

CREATE TABLE unclet.review
(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stars       integer     NOT NULL,
    name        text        NOT NULL,
    description text        NOT NULL,
    visible     boolean     NOT NULL,
    created     timestamptz NOT NULL,
    updated     timestamptz NOT NULL
);

CREATE TABLE unclet.inquiry
(
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status   text        NOT NULL,
    name     text        NOT NULL,
    email    text        NOT NULL,
    phone    text        NOT NULL,
    date     date        NOT NULL,
    location text        NOT NULL,
    guests   integer     NOT NULL,
    note     text,
    created  timestamptz NOT NULL,
    updated  timestamptz NOT NULL
);

-- todo review message sending and retry

