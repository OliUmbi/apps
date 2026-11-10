-- Anonymous, pre-aggregated page-view counts. One row per site, day and route
-- template; no address, cookie or visitor identifier exists anywhere in the
-- pipeline. The site roles may only add to their counter, Studio may only read.
CREATE SCHEMA analytics;

CREATE TABLE analytics.view_daily
(
    site  text    NOT NULL,
    day   date    NOT NULL,
    route text    NOT NULL,
    views integer NOT NULL DEFAULT 0,
    PRIMARY KEY (site, day, route)
);

GRANT USAGE ON SCHEMA analytics TO unclet, zelglihof, studio;
GRANT INSERT, UPDATE ON analytics.view_daily TO unclet, zelglihof;
GRANT SELECT ON analytics.view_daily TO studio;
