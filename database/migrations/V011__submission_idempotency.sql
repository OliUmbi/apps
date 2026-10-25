-- Idempotent public submissions (refactoring plan D1): every public form fill sends a
-- browser-generated submission id, and replaying that id must not repeat the business
-- write (duplicate row, stock decrement or queued email). The unique index enforces
-- one row per submission; the column is nullable for rows created outside a public form.

ALTER TABLE jublawoma.donation_commitment
    ADD COLUMN submission_id uuid;

ALTER TABLE unclet.inquiry
    ADD COLUMN submission_id uuid;

ALTER TABLE zelglihof.inquiry
    ADD COLUMN submission_id uuid;

ALTER TABLE zelglihof.product_reservation
    ADD COLUMN submission_id uuid;

CREATE UNIQUE INDEX donation_commitment_submission_id_idx ON jublawoma.donation_commitment (submission_id);

CREATE UNIQUE INDEX inquiry_submission_id_idx ON unclet.inquiry (submission_id);

CREATE UNIQUE INDEX inquiry_submission_id_idx ON zelglihof.inquiry (submission_id);

CREATE UNIQUE INDEX product_reservation_submission_id_idx ON zelglihof.product_reservation (submission_id);
