ALTER TABLE messaging.outbox
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN locale DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN attempt_count DROP DEFAULT,
    ALTER COLUMN available_at DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE messaging.delivery_attempt
    ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE identity.account
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN enabled DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE identity.session
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN last_seen_at DROP DEFAULT;

ALTER TABLE zelglihof.newsletter_subscriber
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN locale DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN requested_at DROP DEFAULT,
    ALTER COLUMN last_confirmation_requested_at DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE zelglihof.product
    ALTER COLUMN active DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE zelglihof.product_variant
    ALTER COLUMN active DROP DEFAULT,
    ALTER COLUMN sort_order DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE zelglihof.reservation
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE zelglihof.contact_inquiry
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE unclet.inquiry
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE jublawoma.event
    ALTER COLUMN summary DROP DEFAULT,
    ALTER COLUMN body_markdown DROP DEFAULT,
    ALTER COLUMN location DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE jublawoma.story
    ALTER COLUMN summary DROP DEFAULT,
    ALTER COLUMN body_markdown DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE jublawoma.media_asset
    ALTER COLUMN alt_text DROP DEFAULT,
    ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE jublawoma.event_media
    ALTER COLUMN role DROP DEFAULT,
    ALTER COLUMN position DROP DEFAULT;

ALTER TABLE jublawoma.story_media
    ALTER COLUMN role DROP DEFAULT,
    ALTER COLUMN position DROP DEFAULT;
