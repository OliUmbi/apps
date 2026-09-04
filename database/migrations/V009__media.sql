-- todo maybe media type, size, original, owner, etc.

CREATE TABLE media.image
(
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site    text        NOT NULL,
    visible boolean     NOT NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL
);

