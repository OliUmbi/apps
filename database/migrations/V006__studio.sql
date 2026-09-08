-- A row enables email for an event, e.g. zelglihof.reservation.created.
CREATE TABLE studio.account_notification
(
    account_id uuid        NOT NULL REFERENCES identity.account (id) ON DELETE CASCADE,
    event      text        NOT NULL,
    created_at timestamptz NOT NULL,
    PRIMARY KEY (account_id, event)
);
