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
const zelglihof = pgSchema("zelglihof");

export const promotion = zelglihof.table("promotion", {
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

export const article = zelglihof.table("article", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	imageId: uuid("image_id"),
	body: text("body").notNull(),
	published: boolean("published").notNull(),
	publishedOn: date("published_on", { mode: "string" }),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const articleImage = zelglihof.table(
	"article_image",
	{
		articleId: uuid("article_id").notNull(),
		imageId: uuid("image_id").notNull(),
		description: text("description").notNull(),
		createdAt: isoTimestamp("created_at").notNull(),
		updatedAt: isoTimestamp("updated_at").notNull(),
	},
	(table) => [primaryKey({ columns: [table.articleId, table.imageId] })],
);

export const product = zelglihof.table("product", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	body: text("body").notNull(),
	imageId: uuid("image_id"),
	visible: boolean("visible").notNull(),
	reservable: boolean("reservable").notNull(),
	startsAt: isoTimestamp("starts_at"),
	endsAt: isoTimestamp("ends_at"),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const productVariant = zelglihof.table("product_variant", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	imageId: uuid("image_id"),
	price: text("price").notNull(),
	quantity: integer("quantity"),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const productReservation = zelglihof.table("product_reservation", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id"),
	productVariantId: uuid("product_variant_id"),
	productName: text("product_name").notNull(),
	variantName: text("variant_name").notNull(),
	variantDescription: text("variant_description"),
	variantQuantity: integer("variant_quantity"),
	variantPrice: text("variant_price").notNull(),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	email: text("email"),
	quantity: integer("quantity").notNull(),
	note: text("note"),
	status: text("status", { enum: statusValues }).notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const subscriber = zelglihof.table("subscriber", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	status: text("status", {
		enum: ["pending", "active", "unsubscribed"],
	}).notNull(),
	requestedAt: isoTimestamp("requested_at").notNull(),
	confirmedAt: isoTimestamp("confirmed_at"),
	unsubscribedAt: isoTimestamp("unsubscribed_at"),
	confirmationTokenHash: text("confirmation_token_hash").notNull().unique(),
	unsubscribeToken: text("unsubscribe_token").notNull().unique(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const campaign = zelglihof.table("campaign", {
	id: uuid("id").primaryKey().defaultRandom(),
	subject: text("subject").notNull(),
	body: text("body").notNull(),
	status: text("status", { enum: ["draft", "queued"] }).notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});

export const inquiry = zelglihof.table("inquiry", {
	id: uuid("id").primaryKey().defaultRandom(),
	status: text("status", { enum: statusValues }).notNull(),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	email: text("email"),
	message: text("message").notNull(),
	createdAt: isoTimestamp("created_at").notNull(),
	updatedAt: isoTimestamp("updated_at").notNull(),
});
