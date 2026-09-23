import { isoTimestamp } from "@oliumbi/database/columns";
import {
	boolean,
	date,
	numeric,
	pgSchema,
	primaryKey,
	text,
	uuid,
} from "drizzle-orm/pg-core";

// Flyway owns migrations and database constraints. These tables describe query types.
const jublawoma = pgSchema("jublawoma");

export const promotion = jublawoma.table("promotion", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	link: text("link").notNull(),
	imageId: uuid("image_id"),
	startsAt: isoTimestamp("starts_at").notNull(),
	endsAt: isoTimestamp("ends_at").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const story = jublawoma.table("story", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	author: text("author").notNull(),
	imageId: uuid("image_id"),
	body: text("body").notNull(),
	published: boolean("published").notNull(),
	publishedOn: date("published_on", { mode: "string" }),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const storyImage = jublawoma.table(
	"story_image",
	{
		storyId: uuid("story_id").notNull(),
		imageId: uuid("image_id").notNull(),
		description: text("description").notNull(),
		createdAt: isoTimestamp("created_at").notNull(),
		updatedAt: isoTimestamp("updated_at").notNull(),
	},
	(table) => [primaryKey({ columns: [table.storyId, table.imageId] })],
);

export const event = jublawoma.table("event", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	location: text("location").notNull(),
	imageId: uuid("image_id"),
	startsOn: date("starts_on", { mode: "string" }).notNull(),
	endsOn: date("ends_on", { mode: "string" }).notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const member = jublawoma.table("member", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	leadership: boolean("leadership").notNull(),
	imageId: uuid("image_id"),
	groupName: text("group_name").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const donation = jublawoma.table("donation", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	contact: text("contact").notNull(),
	startsAt: isoTimestamp("starts_at").notNull(),
	endsAt: isoTimestamp("ends_at").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const donationItem = jublawoma.table("donation_item", {
	id: uuid("id").primaryKey().defaultRandom(),
	donationId: uuid("donation_id").notNull(),
	name: text("name").notNull(),
	detail: text("detail"),
	quantity: numeric("quantity", { mode: "number" }).notNull(),
	step: numeric("step", { mode: "number" }).notNull(),
	unit: text("unit").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const donationCommitment = jublawoma.table("donation_commitment", {
	id: uuid("id").primaryKey().defaultRandom(),
	donationId: uuid("donation_id"),
	donationItemId: uuid("donation_item_id"),
	donationTitle: text("donation_title").notNull(),
	itemName: text("item_name").notNull(),
	itemDetail: text("item_detail"),
	itemQuantity: numeric("item_quantity", { mode: "number" }).notNull(),
	step: numeric("step", { mode: "number" }).notNull(),
	unit: text("unit").notNull(),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	quantity: numeric("quantity", { mode: "number" }).notNull(),
	note: text("note"),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});
