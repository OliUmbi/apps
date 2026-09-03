--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: identity; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA identity;


--
-- Name: jublawoma; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA jublawoma;


--
-- Name: messaging; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA messaging;


--
-- Name: unclet; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA unclet;


--
-- Name: zelglihof; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA zelglihof;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: identity; Owner: -
--

CREATE TABLE identity.account (
    id uuid NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    enabled boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT identity_account_username_normalized CHECK ((username = lower(btrim(username))))
);


--
-- Name: session; Type: TABLE; Schema: identity; Owner: -
--

CREATE TABLE identity.session (
    id uuid NOT NULL,
    token_hash text NOT NULL,
    account_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone
);


--
-- Name: event; Type: TABLE; Schema: jublawoma; Owner: -
--

CREATE TABLE jublawoma.event (
    id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    body_markdown text NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    location text NOT NULL,
    registration_url text,
    status text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT event_check CHECK ((ends_on >= starts_on)),
    CONSTRAINT event_slug_check CHECK ((slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
    CONSTRAINT event_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text])))
);


--
-- Name: event_media; Type: TABLE; Schema: jublawoma; Owner: -
--

CREATE TABLE jublawoma.event_media (
    event_id uuid NOT NULL,
    media_id uuid NOT NULL,
    role text NOT NULL,
    "position" integer NOT NULL,
    CONSTRAINT event_media_position_check CHECK (("position" >= 0)),
    CONSTRAINT event_media_role_check CHECK ((role = ANY (ARRAY['cover'::text, 'gallery'::text])))
);


--
-- Name: media_asset; Type: TABLE; Schema: jublawoma; Owner: -
--

CREATE TABLE jublawoma.media_asset (
    id uuid NOT NULL,
    storage_key text NOT NULL,
    alt_text text NOT NULL,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: published_event; Type: VIEW; Schema: jublawoma; Owner: -
--

CREATE VIEW jublawoma.published_event AS
 SELECT id,
    slug,
    title,
    summary,
    body_markdown,
    starts_on,
    ends_on,
    location,
    registration_url
   FROM jublawoma.event
  WHERE (status = 'published'::text);


--
-- Name: published_event_media; Type: VIEW; Schema: jublawoma; Owner: -
--

CREATE VIEW jublawoma.published_event_media AS
 SELECT em.event_id,
    m.id,
    m.storage_key,
    m.alt_text,
    em.role,
    em."position"
   FROM ((jublawoma.event_media em
     JOIN jublawoma.event e ON (((e.id = em.event_id) AND (e.status = 'published'::text))))
     JOIN jublawoma.media_asset m ON ((m.id = em.media_id)));


--
-- Name: story; Type: TABLE; Schema: jublawoma; Owner: -
--

CREATE TABLE jublawoma.story (
    id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    body_markdown text NOT NULL,
    status text NOT NULL,
    published_on date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT story_slug_check CHECK ((slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
    CONSTRAINT story_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])))
);


--
-- Name: published_story; Type: VIEW; Schema: jublawoma; Owner: -
--

CREATE VIEW jublawoma.published_story AS
 SELECT id,
    slug,
    title,
    summary,
    body_markdown,
    published_on,
    created_at
   FROM jublawoma.story
  WHERE (status = 'published'::text);


--
-- Name: story_media; Type: TABLE; Schema: jublawoma; Owner: -
--

CREATE TABLE jublawoma.story_media (
    story_id uuid NOT NULL,
    media_id uuid NOT NULL,
    role text NOT NULL,
    "position" integer NOT NULL,
    CONSTRAINT story_media_position_check CHECK (("position" >= 0)),
    CONSTRAINT story_media_role_check CHECK ((role = ANY (ARRAY['cover'::text, 'gallery'::text])))
);


--
-- Name: published_story_media; Type: VIEW; Schema: jublawoma; Owner: -
--

CREATE VIEW jublawoma.published_story_media AS
 SELECT sm.story_id,
    m.id,
    m.storage_key,
    m.alt_text,
    sm.role,
    sm."position"
   FROM ((jublawoma.story_media sm
     JOIN jublawoma.story s ON (((s.id = sm.story_id) AND (s.status = 'published'::text))))
     JOIN jublawoma.media_asset m ON ((m.id = sm.media_id)));


--
-- Name: correlation_tombstone; Type: TABLE; Schema: messaging; Owner: -
--

CREATE TABLE messaging.correlation_tombstone (
    correlation_key text NOT NULL,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: delivery_attempt; Type: TABLE; Schema: messaging; Owner: -
--

CREATE TABLE messaging.delivery_attempt (
    id bigint NOT NULL,
    outbox_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    outcome text NOT NULL,
    error_message text,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT delivery_attempt_outcome_check CHECK ((outcome = ANY (ARRAY['sent'::text, 'retry'::text, 'failed'::text])))
);


--
-- Name: delivery_attempt_id_seq; Type: SEQUENCE; Schema: messaging; Owner: -
--

ALTER TABLE messaging.delivery_attempt ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME messaging.delivery_attempt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: outbox; Type: TABLE; Schema: messaging; Owner: -
--

CREATE TABLE messaging.outbox (
    id uuid NOT NULL,
    message_type text NOT NULL,
    recipient_email text NOT NULL,
    locale text NOT NULL,
    payload jsonb NOT NULL,
    correlation_key text,
    status text NOT NULL,
    attempt_count integer NOT NULL,
    available_at timestamp with time zone NOT NULL,
    locked_at timestamp with time zone,
    sent_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT outbox_attempt_count_check CHECK ((attempt_count >= 0)),
    CONSTRAINT outbox_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'scrubbed'::text])))
);


--
-- Name: inquiry; Type: TABLE; Schema: unclet; Owner: -
--

CREATE TABLE unclet.inquiry (
    id uuid NOT NULL,
    customer_name text NOT NULL,
    email text,
    phone text,
    event_date date,
    location text NOT NULL,
    guest_count integer NOT NULL,
    note text,
    status text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT inquiry_contact_required CHECK (((NULLIF(btrim(email), ''::text) IS NOT NULL) OR (NULLIF(btrim(phone), ''::text) IS NOT NULL))),
    CONSTRAINT inquiry_guest_count_check CHECK (((guest_count > 0) AND (guest_count <= 10000))),
    CONSTRAINT inquiry_status_check CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'quoted'::text, 'confirmed'::text, 'closed'::text, 'declined'::text])))
);


--
-- Name: outgoing_message; Type: TABLE; Schema: unclet; Owner: -
--

CREATE TABLE unclet.outgoing_message (
    id uuid NOT NULL,
    message_type text NOT NULL,
    recipient_email text NOT NULL,
    locale text NOT NULL,
    payload jsonb NOT NULL,
    correlation_key text,
    attempt_count integer NOT NULL,
    available_at timestamp with time zone NOT NULL,
    last_error text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT outgoing_message_attempt_count_check CHECK ((attempt_count >= 0)),
    CONSTRAINT outgoing_message_locale_check CHECK ((locale = ANY (ARRAY['de-CH'::text, 'en'::text])))
);


--
-- Name: contact_inquiry; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.contact_inquiry (
    id uuid NOT NULL,
    customer_name text NOT NULL,
    email text,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT contact_inquiry_contact_required CHECK (((NULLIF(btrim(email), ''::text) IS NOT NULL) OR (NULLIF(btrim(phone), ''::text) IS NOT NULL))),
    CONSTRAINT contact_inquiry_status_check CHECK ((status = ANY (ARRAY['new'::text, 'answered'::text, 'archived'::text])))
);


--
-- Name: newsletter_subscriber; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.newsletter_subscriber (
    id uuid NOT NULL,
    email text NOT NULL,
    email_normalized text NOT NULL,
    locale text NOT NULL,
    status text NOT NULL,
    consent_source text NOT NULL,
    consent_text_version text NOT NULL,
    requested_at timestamp with time zone NOT NULL,
    confirmed_at timestamp with time zone,
    unsubscribed_at timestamp with time zone,
    last_confirmation_requested_at timestamp with time zone NOT NULL,
    confirmation_token_hash text NOT NULL,
    confirmation_expires_at timestamp with time zone,
    unsubscribe_token text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT newsletter_subscriber_confirmation_state CHECK ((((status = 'pending'::text) AND (confirmation_expires_at IS NOT NULL)) OR (status <> 'pending'::text))),
    CONSTRAINT newsletter_subscriber_email_normalized CHECK ((email_normalized = lower(btrim(email_normalized)))),
    CONSTRAINT newsletter_subscriber_locale_check CHECK ((locale = ANY (ARRAY['de-CH'::text, 'en'::text]))),
    CONSTRAINT newsletter_subscriber_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'unsubscribed'::text])))
);


--
-- Name: outgoing_message; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.outgoing_message (
    id uuid NOT NULL,
    message_type text NOT NULL,
    recipient_email text NOT NULL,
    locale text NOT NULL,
    payload jsonb NOT NULL,
    correlation_key text,
    attempt_count integer NOT NULL,
    available_at timestamp with time zone NOT NULL,
    last_error text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT outgoing_message_attempt_count_check CHECK ((attempt_count >= 0)),
    CONSTRAINT outgoing_message_locale_check CHECK ((locale = ANY (ARRAY['de-CH'::text, 'en'::text])))
);


--
-- Name: product; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.product (
    id text NOT NULL,
    name text NOT NULL,
    active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: product_variant; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.product_variant (
    id text NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    stock_quantity integer NOT NULL,
    active boolean NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT product_variant_stock_quantity_check CHECK ((stock_quantity >= 0))
);


--
-- Name: reservation; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.reservation (
    id uuid NOT NULL,
    product_id text NOT NULL,
    variant_id text NOT NULL,
    customer_name text NOT NULL,
    email text,
    phone text,
    quantity integer NOT NULL,
    note text,
    status text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT reservation_contact_required CHECK (((NULLIF(btrim(email), ''::text) IS NOT NULL) OR (NULLIF(btrim(phone), ''::text) IS NOT NULL))),
    CONSTRAINT reservation_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT reservation_status_check CHECK ((status = ANY (ARRAY['new'::text, 'confirmed'::text, 'ready'::text, 'collected'::text, 'cancelled'::text])))
);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: identity; Owner: -
--

ALTER TABLE ONLY identity.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: identity; Owner: -
--

ALTER TABLE ONLY identity.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_hash_key; Type: CONSTRAINT; Schema: identity; Owner: -
--

ALTER TABLE ONLY identity.session
    ADD CONSTRAINT session_token_hash_key UNIQUE (token_hash);


--
-- Name: event_media event_media_pkey; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.event_media
    ADD CONSTRAINT event_media_pkey PRIMARY KEY (event_id, media_id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: event event_slug_key; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.event
    ADD CONSTRAINT event_slug_key UNIQUE (slug);


--
-- Name: media_asset media_asset_pkey; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.media_asset
    ADD CONSTRAINT media_asset_pkey PRIMARY KEY (id);


--
-- Name: media_asset media_asset_storage_key_key; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.media_asset
    ADD CONSTRAINT media_asset_storage_key_key UNIQUE (storage_key);


--
-- Name: story_media story_media_pkey; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.story_media
    ADD CONSTRAINT story_media_pkey PRIMARY KEY (story_id, media_id);


--
-- Name: story story_pkey; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.story
    ADD CONSTRAINT story_pkey PRIMARY KEY (id);


--
-- Name: story story_slug_key; Type: CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.story
    ADD CONSTRAINT story_slug_key UNIQUE (slug);


--
-- Name: correlation_tombstone correlation_tombstone_pkey; Type: CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.correlation_tombstone
    ADD CONSTRAINT correlation_tombstone_pkey PRIMARY KEY (correlation_key);


--
-- Name: delivery_attempt delivery_attempt_outbox_id_attempt_number_key; Type: CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.delivery_attempt
    ADD CONSTRAINT delivery_attempt_outbox_id_attempt_number_key UNIQUE (outbox_id, attempt_number);


--
-- Name: delivery_attempt delivery_attempt_pkey; Type: CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.delivery_attempt
    ADD CONSTRAINT delivery_attempt_pkey PRIMARY KEY (id);


--
-- Name: outbox outbox_pkey; Type: CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.outbox
    ADD CONSTRAINT outbox_pkey PRIMARY KEY (id);


--
-- Name: inquiry inquiry_pkey; Type: CONSTRAINT; Schema: unclet; Owner: -
--

ALTER TABLE ONLY unclet.inquiry
    ADD CONSTRAINT inquiry_pkey PRIMARY KEY (id);


--
-- Name: outgoing_message outgoing_message_pkey; Type: CONSTRAINT; Schema: unclet; Owner: -
--

ALTER TABLE ONLY unclet.outgoing_message
    ADD CONSTRAINT outgoing_message_pkey PRIMARY KEY (id);


--
-- Name: contact_inquiry contact_inquiry_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.contact_inquiry
    ADD CONSTRAINT contact_inquiry_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscriber newsletter_subscriber_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.newsletter_subscriber
    ADD CONSTRAINT newsletter_subscriber_pkey PRIMARY KEY (id);


--
-- Name: outgoing_message outgoing_message_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.outgoing_message
    ADD CONSTRAINT outgoing_message_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- Name: identity_account_username_uq; Type: INDEX; Schema: identity; Owner: -
--

CREATE UNIQUE INDEX identity_account_username_uq ON identity.account USING btree (username);


--
-- Name: identity_session_active_idx; Type: INDEX; Schema: identity; Owner: -
--

CREATE INDEX identity_session_active_idx ON identity.session USING btree (token_hash, expires_at) WHERE (revoked_at IS NULL);


--
-- Name: event_public_idx; Type: INDEX; Schema: jublawoma; Owner: -
--

CREATE INDEX event_public_idx ON jublawoma.event USING btree (starts_on, status);


--
-- Name: event_single_cover_idx; Type: INDEX; Schema: jublawoma; Owner: -
--

CREATE UNIQUE INDEX event_single_cover_idx ON jublawoma.event_media USING btree (event_id) WHERE (role = 'cover'::text);


--
-- Name: story_public_idx; Type: INDEX; Schema: jublawoma; Owner: -
--

CREATE INDEX story_public_idx ON jublawoma.story USING btree (published_on DESC, status);


--
-- Name: story_single_cover_idx; Type: INDEX; Schema: jublawoma; Owner: -
--

CREATE UNIQUE INDEX story_single_cover_idx ON jublawoma.story_media USING btree (story_id) WHERE (role = 'cover'::text);


--
-- Name: outbox_claim_idx; Type: INDEX; Schema: messaging; Owner: -
--

CREATE INDEX outbox_claim_idx ON messaging.outbox USING btree (available_at, created_at) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: outbox_correlation_idx; Type: INDEX; Schema: messaging; Owner: -
--

CREATE INDEX outbox_correlation_idx ON messaging.outbox USING btree (correlation_key) WHERE (correlation_key IS NOT NULL);


--
-- Name: inquiry_event_date_idx; Type: INDEX; Schema: unclet; Owner: -
--

CREATE INDEX inquiry_event_date_idx ON unclet.inquiry USING btree (event_date) WHERE ((event_date IS NOT NULL) AND (status <> ALL (ARRAY['closed'::text, 'declined'::text])));


--
-- Name: inquiry_status_created_idx; Type: INDEX; Schema: unclet; Owner: -
--

CREATE INDEX inquiry_status_created_idx ON unclet.inquiry USING btree (status, created_at DESC);


--
-- Name: unclet_outgoing_message_due_idx; Type: INDEX; Schema: unclet; Owner: -
--

CREATE INDEX unclet_outgoing_message_due_idx ON unclet.outgoing_message USING btree (available_at, created_at);


--
-- Name: contact_inquiry_status_created_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX contact_inquiry_status_created_idx ON zelglihof.contact_inquiry USING btree (status, created_at DESC);


--
-- Name: newsletter_subscriber_confirmation_token_uq; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscriber_confirmation_token_uq ON zelglihof.newsletter_subscriber USING btree (confirmation_token_hash);


--
-- Name: newsletter_subscriber_email_uq; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscriber_email_uq ON zelglihof.newsletter_subscriber USING btree (email_normalized);


--
-- Name: newsletter_subscriber_status_requested_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX newsletter_subscriber_status_requested_idx ON zelglihof.newsletter_subscriber USING btree (status, requested_at DESC);


--
-- Name: newsletter_subscriber_unsubscribe_token_uq; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscriber_unsubscribe_token_uq ON zelglihof.newsletter_subscriber USING btree (unsubscribe_token);


--
-- Name: product_variant_product_sort_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX product_variant_product_sort_idx ON zelglihof.product_variant USING btree (product_id, sort_order);


--
-- Name: reservation_product_created_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX reservation_product_created_idx ON zelglihof.reservation USING btree (product_id, created_at DESC);


--
-- Name: reservation_status_created_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX reservation_status_created_idx ON zelglihof.reservation USING btree (status, created_at DESC);


--
-- Name: zelglihof_outgoing_message_due_idx; Type: INDEX; Schema: zelglihof; Owner: -
--

CREATE INDEX zelglihof_outgoing_message_due_idx ON zelglihof.outgoing_message USING btree (available_at, created_at);


--
-- Name: session session_account_id_fkey; Type: FK CONSTRAINT; Schema: identity; Owner: -
--

ALTER TABLE ONLY identity.session
    ADD CONSTRAINT session_account_id_fkey FOREIGN KEY (account_id) REFERENCES identity.account(id) ON DELETE CASCADE;


--
-- Name: event_media event_media_event_id_fkey; Type: FK CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.event_media
    ADD CONSTRAINT event_media_event_id_fkey FOREIGN KEY (event_id) REFERENCES jublawoma.event(id) ON DELETE CASCADE;


--
-- Name: event_media event_media_media_id_fkey; Type: FK CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.event_media
    ADD CONSTRAINT event_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES jublawoma.media_asset(id) ON DELETE CASCADE;


--
-- Name: story_media story_media_media_id_fkey; Type: FK CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.story_media
    ADD CONSTRAINT story_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES jublawoma.media_asset(id) ON DELETE CASCADE;


--
-- Name: story_media story_media_story_id_fkey; Type: FK CONSTRAINT; Schema: jublawoma; Owner: -
--

ALTER TABLE ONLY jublawoma.story_media
    ADD CONSTRAINT story_media_story_id_fkey FOREIGN KEY (story_id) REFERENCES jublawoma.story(id) ON DELETE CASCADE;


--
-- Name: delivery_attempt delivery_attempt_outbox_id_fkey; Type: FK CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.delivery_attempt
    ADD CONSTRAINT delivery_attempt_outbox_id_fkey FOREIGN KEY (outbox_id) REFERENCES messaging.outbox(id) ON DELETE CASCADE;


--
-- Name: product_variant product_variant_product_id_fkey; Type: FK CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.product_variant
    ADD CONSTRAINT product_variant_product_id_fkey FOREIGN KEY (product_id) REFERENCES zelglihof.product(id);


--
-- Name: reservation reservation_product_id_fkey; Type: FK CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.reservation
    ADD CONSTRAINT reservation_product_id_fkey FOREIGN KEY (product_id) REFERENCES zelglihof.product(id);


--
-- Name: reservation reservation_variant_id_fkey; Type: FK CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.reservation
    ADD CONSTRAINT reservation_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES zelglihof.product_variant(id);


--
-- Name: SCHEMA identity; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA identity TO identity_service;


--
-- Name: SCHEMA jublawoma; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA jublawoma TO jublawoma_web;
GRANT USAGE ON SCHEMA jublawoma TO studio_web;


--
-- Name: SCHEMA messaging; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA messaging TO messaging_service;


--
-- Name: SCHEMA unclet; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA unclet TO unclet_web;
GRANT USAGE ON SCHEMA unclet TO studio_web;


--
-- Name: SCHEMA zelglihof; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA zelglihof TO zelglihof_web;
GRANT USAGE ON SCHEMA zelglihof TO studio_web;


--
-- Name: TABLE account; Type: ACL; Schema: identity; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE identity.account TO identity_service;


--
-- Name: TABLE session; Type: ACL; Schema: identity; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE identity.session TO identity_service;


--
-- Name: TABLE event; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE jublawoma.event TO studio_web;


--
-- Name: TABLE event_media; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE jublawoma.event_media TO studio_web;


--
-- Name: TABLE media_asset; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE jublawoma.media_asset TO studio_web;


--
-- Name: TABLE published_event; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT ON TABLE jublawoma.published_event TO jublawoma_web;


--
-- Name: TABLE published_event_media; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT ON TABLE jublawoma.published_event_media TO jublawoma_web;


--
-- Name: TABLE story; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE jublawoma.story TO studio_web;


--
-- Name: TABLE published_story; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT ON TABLE jublawoma.published_story TO jublawoma_web;


--
-- Name: TABLE story_media; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE jublawoma.story_media TO studio_web;


--
-- Name: TABLE published_story_media; Type: ACL; Schema: jublawoma; Owner: -
--

GRANT SELECT ON TABLE jublawoma.published_story_media TO jublawoma_web;


--
-- Name: TABLE correlation_tombstone; Type: ACL; Schema: messaging; Owner: -
--

GRANT SELECT,INSERT ON TABLE messaging.correlation_tombstone TO messaging_service;


--
-- Name: TABLE delivery_attempt; Type: ACL; Schema: messaging; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE messaging.delivery_attempt TO messaging_service;


--
-- Name: SEQUENCE delivery_attempt_id_seq; Type: ACL; Schema: messaging; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE messaging.delivery_attempt_id_seq TO messaging_service;


--
-- Name: TABLE outbox; Type: ACL; Schema: messaging; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE messaging.outbox TO messaging_service;


--
-- Name: TABLE inquiry; Type: ACL; Schema: unclet; Owner: -
--

GRANT INSERT ON TABLE unclet.inquiry TO unclet_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE unclet.inquiry TO studio_web;


--
-- Name: TABLE outgoing_message; Type: ACL; Schema: unclet; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE unclet.outgoing_message TO unclet_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE unclet.outgoing_message TO studio_web;


--
-- Name: TABLE contact_inquiry; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT INSERT ON TABLE zelglihof.contact_inquiry TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.contact_inquiry TO studio_web;


--
-- Name: TABLE newsletter_subscriber; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT SELECT,INSERT,UPDATE ON TABLE zelglihof.newsletter_subscriber TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.newsletter_subscriber TO studio_web;


--
-- Name: TABLE outgoing_message; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.outgoing_message TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.outgoing_message TO studio_web;


--
-- Name: TABLE product; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT SELECT ON TABLE zelglihof.product TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.product TO studio_web;


--
-- Name: TABLE product_variant; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT SELECT ON TABLE zelglihof.product_variant TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.product_variant TO studio_web;


--
-- Name: COLUMN product_variant.stock_quantity; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT UPDATE(stock_quantity) ON TABLE zelglihof.product_variant TO zelglihof_web;


--
-- Name: COLUMN product_variant.updated_at; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT UPDATE(updated_at) ON TABLE zelglihof.product_variant TO zelglihof_web;


--
-- Name: TABLE reservation; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT INSERT ON TABLE zelglihof.reservation TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.reservation TO studio_web;


--
-- PostgreSQL database dump complete
--


