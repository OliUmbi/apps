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
-- Name: messaging; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA messaging;


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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT identity_account_username_normalized CHECK ((username = lower(btrim(username))))
);


--
-- Name: session; Type: TABLE; Schema: identity; Owner: -
--

CREATE TABLE identity.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_hash text NOT NULL,
    account_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_type text NOT NULL,
    recipient_email text NOT NULL,
    locale text DEFAULT 'de-CH'::text NOT NULL,
    payload jsonb NOT NULL,
    correlation_key text,
    status text DEFAULT 'pending'::text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    available_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone,
    sent_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT outbox_attempt_count_check CHECK ((attempt_count >= 0)),
    CONSTRAINT outbox_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text])))
);


--
-- Name: newsletter_subscriber; Type: TABLE; Schema: zelglihof; Owner: -
--

CREATE TABLE zelglihof.newsletter_subscriber (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    email_normalized text NOT NULL,
    locale text DEFAULT 'de-CH'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    consent_source text NOT NULL,
    consent_text_version text NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    confirmed_at timestamp with time zone,
    unsubscribed_at timestamp with time zone,
    last_confirmation_requested_at timestamp with time zone DEFAULT now() NOT NULL,
    confirmation_token_hash text NOT NULL,
    confirmation_expires_at timestamp with time zone,
    unsubscribe_token text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT newsletter_subscriber_confirmation_state CHECK ((((status = 'pending'::text) AND (confirmation_expires_at IS NOT NULL)) OR (status <> 'pending'::text))),
    CONSTRAINT newsletter_subscriber_email_normalized CHECK ((email_normalized = lower(btrim(email_normalized)))),
    CONSTRAINT newsletter_subscriber_locale_check CHECK ((locale = ANY (ARRAY['de-CH'::text, 'en'::text]))),
    CONSTRAINT newsletter_subscriber_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'unsubscribed'::text])))
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
-- Name: newsletter_subscriber newsletter_subscriber_pkey; Type: CONSTRAINT; Schema: zelglihof; Owner: -
--

ALTER TABLE ONLY zelglihof.newsletter_subscriber
    ADD CONSTRAINT newsletter_subscriber_pkey PRIMARY KEY (id);


--
-- Name: identity_account_username_uq; Type: INDEX; Schema: identity; Owner: -
--

CREATE UNIQUE INDEX identity_account_username_uq ON identity.account USING btree (username);


--
-- Name: identity_session_active_idx; Type: INDEX; Schema: identity; Owner: -
--

CREATE INDEX identity_session_active_idx ON identity.session USING btree (token_hash, expires_at) WHERE (revoked_at IS NULL);


--
-- Name: outbox_claim_idx; Type: INDEX; Schema: messaging; Owner: -
--

CREATE INDEX outbox_claim_idx ON messaging.outbox USING btree (available_at, created_at) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: outbox_correlation_idx; Type: INDEX; Schema: messaging; Owner: -
--

CREATE INDEX outbox_correlation_idx ON messaging.outbox USING btree (correlation_key) WHERE (correlation_key IS NOT NULL);


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
-- Name: session session_account_id_fkey; Type: FK CONSTRAINT; Schema: identity; Owner: -
--

ALTER TABLE ONLY identity.session
    ADD CONSTRAINT session_account_id_fkey FOREIGN KEY (account_id) REFERENCES identity.account(id) ON DELETE CASCADE;


--
-- Name: delivery_attempt delivery_attempt_outbox_id_fkey; Type: FK CONSTRAINT; Schema: messaging; Owner: -
--

ALTER TABLE ONLY messaging.delivery_attempt
    ADD CONSTRAINT delivery_attempt_outbox_id_fkey FOREIGN KEY (outbox_id) REFERENCES messaging.outbox(id) ON DELETE CASCADE;


--
-- Name: SCHEMA identity; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA identity TO identity_service;


--
-- Name: SCHEMA messaging; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA messaging TO messaging_service;
GRANT USAGE ON SCHEMA messaging TO zelglihof_web;
GRANT USAGE ON SCHEMA messaging TO studio_web;


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
GRANT INSERT ON TABLE messaging.outbox TO zelglihof_web;
GRANT INSERT ON TABLE messaging.outbox TO studio_web;


--
-- Name: TABLE newsletter_subscriber; Type: ACL; Schema: zelglihof; Owner: -
--

GRANT SELECT,INSERT,UPDATE ON TABLE zelglihof.newsletter_subscriber TO zelglihof_web;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE zelglihof.newsletter_subscriber TO studio_web;


--
-- PostgreSQL database dump complete
--


