import { date, integer, pgSchema, primaryKey, text } from "drizzle-orm/pg-core";

// Flyway owns the schema, the table and the grants. This declaration is for
// query types. Counters are pre-aggregated, so the row count stays proportional
// to sites x days x routes instead of visitors.
const analytics = pgSchema("analytics");

export const viewDaily = analytics.table(
	"view_daily",
	{
		site: text("site").notNull(),
		day: date("day", { mode: "string" }).notNull(),
		route: text("route").notNull(),
		views: integer("views").notNull().default(0),
	},
	(table) => [primaryKey({ columns: [table.site, table.day, table.route] })],
);
