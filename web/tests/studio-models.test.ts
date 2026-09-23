import assert from "node:assert/strict";
import test from "node:test";
import {
	newStoryInput,
	storyInputSchema,
} from "../packages/jublawoma-data/src/content/story";
import { storyImageKeySchema } from "../packages/jublawoma-data/src/content/story-image";
import { campaignInputSchema } from "../packages/zelglihof-data/src/content/campaign";
import {
	newProductInput,
	productInputSchema,
} from "../packages/zelglihof-data/src/content/product";
import { productReservationInputSchema } from "../packages/zelglihof-data/src/content/product-reservation";
import { productVariantInputSchema } from "../packages/zelglihof-data/src/content/product-variant";
import {
	newPromotionInput,
	promotionInputSchema,
} from "../packages/zelglihof-data/src/content/promotion";
import { slugify } from "../sites/studio/src/model/content/slug";

const id = "6c7e6880-5e35-48d7-9a5a-82dfd56e439b";
const now = new Date("2026-09-17T12:00:00Z");

test("product availability supports open bounds and rejects reversed dates", () => {
	const product = {
		...newProductInput(),
		name: "Apples",
		description: "From the farm",
		body: "Available in autumn",
	};
	assert.equal(productInputSchema.safeParse(product).success, true);
	assert.equal(
		productInputSchema.safeParse({ ...product, startsAt: now.toISOString() })
			.success,
		true,
	);
	assert.equal(
		productInputSchema.safeParse({
			...product,
			startsAt: "2026-10-01T10:00:00Z",
			endsAt: now.toISOString(),
		}).success,
		false,
	);
});

test("publication requires a date, while drafts remain valid", () => {
	const story = {
		...newStoryInput(),
		slug: "camp",
		title: "Camp",
		description: "Summer camp",
		author: "Leitung",
		body: "Our camp",
	};
	assert.equal(storyInputSchema.safeParse(story).success, true);
	assert.equal(
		storyInputSchema.safeParse({ ...story, published: true }).success,
		false,
	);
	assert.equal(
		storyInputSchema.safeParse({
			...story,
			published: true,
			publishedOn: "2026-09-17",
		}).success,
		true,
	);
});

test("reservation editing cannot overwrite customer or stock snapshots", () => {
	assert.deepEqual(
		productReservationInputSchema.parse({ status: "completed" }),
		{ status: "completed" },
	);
	for (const field of [
		"name",
		"quantity",
		"productId",
		"variantPrice",
		"createdAt",
	]) {
		assert.equal(
			productReservationInputSchema.safeParse({
				status: "completed",
				[field]: "changed",
			}).success,
			false,
		);
	}
});

test("campaign state is controlled by sending, not by the content editor", () => {
	assert.equal(
		campaignInputSchema.safeParse({
			subject: "News",
			body: "Hello",
			status: "draft",
		}).success,
		false,
	);
	assert.equal(
		campaignInputSchema.safeParse({ subject: "News", body: "Hello" }).success,
		true,
	);
});

test("variants distinguish unlimited stock from zero stock and reject fractional stock", () => {
	const variant = {
		productId: id,
		name: "Small",
		description: null,
		imageId: null,
		price: "CHF 5",
		quantity: null,
	};
	assert.equal(productVariantInputSchema.safeParse(variant).success, true);
	assert.equal(
		productVariantInputSchema.safeParse({ ...variant, quantity: 0 }).success,
		true,
	);
	assert.equal(
		productVariantInputSchema.safeParse({ ...variant, quantity: 1.5 }).success,
		false,
	);
	assert.equal(
		productVariantInputSchema.safeParse({ ...variant, quantity: -1 }).success,
		false,
	);
});

test("gallery identity requires both parent and image, never an invented row id", () => {
	assert.deepEqual(storyImageKeySchema.parse({ storyId: id, imageId: id }), {
		storyId: id,
		imageId: id,
	});
	assert.equal(storyImageKeySchema.safeParse({ id }).success, false);
	assert.equal(storyImageKeySchema.safeParse({ storyId: id }).success, false);
});

test("promotion destinations reject executable and protocol-relative links", () => {
	const promotion = {
		...newPromotionInput(),
		title: "News",
		description: "Read more",
		startsAt: now.toISOString(),
		endsAt: now.toISOString(),
	};
	assert.equal(
		promotionInputSchema.safeParse({ ...promotion, link: "/latest" }).success,
		true,
	);
	for (const link of [
		"javascript:alert(1)",
		"//example.com",
		"/\\\\example.com",
		"data:text/html,test",
	]) {
		assert.equal(
			promotionInputSchema.safeParse({ ...promotion, link }).success,
			false,
		);
	}
});

test("generated slugs remain valid when truncation lands on a separator", () => {
	const slug = slugify(`${"a".repeat(119)} word`);
	assert.equal(slug.endsWith("-"), false);
	assert.equal(slugify("Äpfel & Öl"), "aepfel-oel");
});
