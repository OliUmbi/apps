import { isoTimestamp } from "@oliumbi/database/columns";
import { sql } from "drizzle-orm";
import { pgSchema, text, uuid } from "drizzle-orm/pg-core";

// Flyway owns migrations and database constraints. These tables describe query types.
const queue = pgSchema("queue");

export const message = queue.table("message", {
	id: uuid("id").primaryKey().defaultRandom(),
	site: text("site").notNull(),
	type: text("type").notNull(),
	sender: text("sender").notNull(),
	recipient: text("recipient").notNull(),
	subject: text("subject").notNull(),
	text: text("text").notNull(),
	html: text("html"),
	createdAt: isoTimestamp("created_at").notNull().default(sql`now()`),
	updatedAt: isoTimestamp("updated_at").notNull().default(sql`now()`),
});
