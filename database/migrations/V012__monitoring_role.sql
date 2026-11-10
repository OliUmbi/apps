-- Read-only monitoring role for postgres_exporter. It sees the statistics views
-- (pg_monitor) but no application data; credentials are provisioned from the
-- vault after migrations, like every other role (D9/DR-04).
CREATE ROLE monitoring NOLOGIN;
GRANT pg_monitor TO monitoring;
