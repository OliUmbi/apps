CREATE SCHEMA identity;
CREATE SCHEMA messaging;
CREATE SCHEMA zelglihof;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA identity TO identity_service;
GRANT USAGE ON SCHEMA messaging TO messaging_service;
GRANT USAGE ON SCHEMA messaging TO zelglihof_web, studio_web;
GRANT USAGE ON SCHEMA zelglihof TO zelglihof_web, studio_web;
