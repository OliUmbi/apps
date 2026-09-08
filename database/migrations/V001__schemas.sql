-- schemas
CREATE SCHEMA queue;
CREATE SCHEMA identity;
CREATE SCHEMA messaging;
CREATE SCHEMA assets;

CREATE SCHEMA studio;
CREATE SCHEMA oliumbi;
CREATE SCHEMA jublawoma;
CREATE SCHEMA unclet;
CREATE SCHEMA zelglihof;

-- roles
CREATE ROLE identity LOGIN PASSWORD 'identity_password';
CREATE ROLE messaging LOGIN PASSWORD 'messaging_password';
CREATE ROLE assets LOGIN PASSWORD 'assets_password';

CREATE ROLE studio LOGIN PASSWORD 'studio_password';
CREATE ROLE oliumbi LOGIN PASSWORD 'oliumbi_password';
CREATE ROLE jublawoma LOGIN PASSWORD 'jublawoma_password';
CREATE ROLE unclet LOGIN PASSWORD 'unclet_password';
CREATE ROLE zelglihof LOGIN PASSWORD 'zelglihof_password';

-- permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA identity TO identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO identity;

GRANT USAGE ON SCHEMA queue, messaging TO messaging;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, messaging GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO messaging;

GRANT USAGE ON SCHEMA assets TO assets;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO assets;

GRANT USAGE ON SCHEMA queue, studio, jublawoma, unclet, zelglihof, oliumbi TO studio;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, studio, jublawoma, unclet, zelglihof, oliumbi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO studio;

GRANT USAGE ON SCHEMA queue, oliumbi TO oliumbi;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, oliumbi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO oliumbi;

GRANT USAGE ON SCHEMA queue, jublawoma TO jublawoma;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, jublawoma GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO jublawoma;

GRANT USAGE ON SCHEMA queue, unclet TO unclet;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, unclet GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO unclet;

GRANT USAGE ON SCHEMA queue, zelglihof TO zelglihof;
ALTER DEFAULT PRIVILEGES IN SCHEMA queue, zelglihof GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zelglihof;
