import { statusValues } from "@oliumbi/contracts";
import { isoTimestamp } from "@oliumbi/database/columns";
import {
	boolean,
	date,
	integer,
	pgSchema,
	primaryKey,
	text,
	uuid,
} from "drizzle-orm/pg-core";

// Flyway owns migrations and database constraints. These tables describe query types.
const unclet = pgSchema("unclet");

export const showcase = unclet.table("showcase", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	location: text("location").notNull(),
	guestCount: integer("guest_count").notNull(),
	imageId: uuid("image_id"),
	published: boolean("published").notNull(),
	publishedOn: date("published_on", { mode: "string" }),
	body: text("body"),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const showcaseImage = unclet.table(
	"showcase_image",
	{
		showcaseId: uuid("showcase_id").notNull(),
		imageId: uuid("image_id").notNull(),
		description: text("description").notNull(),
		createdAt: isoTimestamp("created_at").notNull(),
		updatedAt: isoTimestamp("updated_at").notNull(),
	},
	(table) => [primaryKey({ columns: [table.showcaseId, table.imageId] })],
);

export const review = unclet.table("review", {
	id: uuid("id").primaryKey().defaultRandom(),
	stars: integer("stars").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	visible: boolean("visible").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const inquiry = unclet.table("inquiry", {
	id: uuid("id").primaryKey().defaultRandom(),
	status: text("status", { enum: statusValues }).notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	eventOn: date("event_on", { mode: "string" }),
	location: text("location"),
	guestCount: integer("guest_count"),
	note: text("note"),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});
