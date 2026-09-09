-- todo text and html could be combined since the type already determines if it is an email or other so it could just be body or content
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

-- todo I dont dislike the index, it makes sense, but we need to be carful for now not to overindex the db
CREATE INDEX queue_message_created_at_idx ON queue.message (created_at, id);
