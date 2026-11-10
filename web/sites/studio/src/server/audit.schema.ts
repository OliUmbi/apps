import { isoTimestamp } from "@oliumbi/database/columns";
import { sql } from "drizzle-orm";
import { pgSchema, text, uuid } from "drizzle-orm/pg-core";

// Flyway owns the table and its grants. This declaration is for query types.
const studio = pgSchema("studio");

export const auditEvent = studio.table("audit_event", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: isoTimestamp("created_at").notNull().default(sql`now()`),
	site: text("site"),
	actorId: uuid("actor_id"),
	actorName: text("actor_name").notNull(),
	action: text("action").notNull(),
	entity: text("entity").notNull(),
	entityId: text("entity_id"),
	summary: text("summary"),
});
