-- Anonymous, pre-aggregated page-view counts. One row per site, day and route
-- template; no address, cookie or visitor identifier exists anywhere in the
-- pipeline. PostgreSQL requires SELECT on the conflict target for the upsert,
-- so a site role can also read these aggregates (no personal data); Studio is
-- the only UI reader. Tightening this further would need a security-definer
-- writer function.
CREATE SCHEMA analytics;

CREATE TABLE analytics.view_daily
(
    site  text    NOT NULL,
    day   date    NOT NULL,
    route text    NOT NULL,
    views integer NOT NULL DEFAULT 0,
    PRIMARY KEY (site, day, route)
);

GRANT USAGE ON SCHEMA analytics TO jublawoma, unclet, zelglihof, studio;
-- SELECT is part of the upsert contract, not a read feature: PostgreSQL checks
-- it on the conflict target and on every column read by DO UPDATE.
GRANT SELECT, INSERT, UPDATE ON analytics.view_daily TO jublawoma, unclet, zelglihof;
GRANT SELECT ON analytics.view_daily TO studio;
