-- schemas
CREATE SCHEMA queue;
CREATE SCHEMA identity;
CREATE SCHEMA messaging;
CREATE SCHEMA assets;

CREATE SCHEMA studio;
CREATE SCHEMA analytics;

CREATE SCHEMA jublawoma;
CREATE SCHEMA unclet;
CREATE SCHEMA zelglihof;

-- reserved for the future Oliumbi content schema; the role writes only the
-- shared analytics counter
CREATE SCHEMA oliumbi;

-- roles
-- Roles are created NOLOGIN without passwords: credentials are provisioned per
-- environment (development bootstrap in database/README.md, production through
-- the vault/Ansible flow) so no password literal is committed anywhere.
CREATE ROLE identity NOLOGIN;
CREATE ROLE messaging NOLOGIN;
CREATE ROLE assets NOLOGIN;

CREATE ROLE studio NOLOGIN;

CREATE ROLE jublawoma NOLOGIN;
CREATE ROLE unclet NOLOGIN;
CREATE ROLE zelglihof NOLOGIN;

CREATE ROLE oliumbi NOLOGIN;

-- Read-only statistics role for postgres_exporter; it sees pg_monitor's views,
-- never application tables.
CREATE ROLE monitoring NOLOGIN;

-- permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- identity
GRANT USAGE ON SCHEMA identity TO identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO identity;

-- messaging
GRANT USAGE ON SCHEMA queue, messaging TO messaging;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, messaging GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO messaging;

-- assets
GRANT USAGE ON SCHEMA assets TO assets;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO assets;

-- studio: its own data, every site, analytics, and the producer inbox
GRANT USAGE ON SCHEMA queue, studio, analytics, jublawoma, unclet, zelglihof, oliumbi TO studio;
ALTER DEFAULT PRIVILEGES IN SCHEMA studio, jublawoma, unclet, zelglihof, oliumbi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO studio;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue GRANT INSERT ON TABLES TO studio;

-- jublawoma
GRANT USAGE ON SCHEMA queue, jublawoma, analytics TO jublawoma;
ALTER DEFAULT PRIVILEGES IN SCHEMA jublawoma GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO jublawoma;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue GRANT INSERT ON TABLES TO jublawoma;

-- unclet
GRANT USAGE ON SCHEMA queue, unclet, analytics TO unclet;
ALTER DEFAULT PRIVILEGES IN SCHEMA unclet GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO unclet;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue GRANT INSERT ON TABLES TO unclet;

-- zelglihof
GRANT USAGE ON SCHEMA queue, zelglihof, analytics TO zelglihof;
ALTER DEFAULT PRIVILEGES IN SCHEMA zelglihof GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zelglihof;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue GRANT INSERT ON TABLES TO zelglihof;

-- oliumbi is static but writes the shared analytics counter
GRANT USAGE ON SCHEMA queue, oliumbi, analytics TO oliumbi;
ALTER DEFAULT PRIVILEGES IN SCHEMA oliumbi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO oliumbi;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue GRANT INSERT ON TABLES TO oliumbi;

-- monitoring: statistics views only
GRANT pg_monitor TO monitoring;
