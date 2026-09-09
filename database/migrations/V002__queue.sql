CREATE TABLE queue.message
(
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site       text        NOT NULL,
    type       text        NOT NULL,
    sender     text        NOT NULL,
    recipient  text        NOT NULL,
    subject    text        NOT NULL,
    text       text        NOT NULL,
    html       text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX queue_message_created_at_idx ON queue.message (created_at, id);
