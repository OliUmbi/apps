import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createDatabasePool } from "../packages/database/src";
import { createReviewRepository } from "../packages/unclet-data/src/review.repository";
import { donationStore as jublawomaDonationStore } from "../sites/studio/src/server/content/jublawoma/donation.server";
import { donationCommitmentStore as jublawomaDonationCommitmentStore } from "../sites/studio/src/server/content/jublawoma/donation-commitment.server";
import { donationItemStore as jublawomaDonationItemStore } from "../sites/studio/src/server/content/jublawoma/donation-item.server";
import { eventStore as jublawomaEventStore } from "../sites/studio/src/server/content/jublawoma/event.server";
import { memberStore as jublawomaMemberStore } from "../sites/studio/src/server/content/jublawoma/member.server";
import { promotionStore as jublawomaPromotionStore } from "../sites/studio/src/server/content/jublawoma/promotion.server";
import { storyStore as jublawomaStoryStore } from "../sites/studio/src/server/content/jublawoma/story.server";
import { storyImageStore as jublawomaStoryImageStore } from "../sites/studio/src/server/content/jublawoma/story-image.server";
import { inquiryStore as uncletInquiryStore } from "../sites/studio/src/server/content/unclet/inquiry.server";
import { reviewStore as uncletReviewStore } from "../sites/studio/src/server/content/unclet/review.server";
import { showcaseStore as uncletShowcaseStore } from "../sites/studio/src/server/content/unclet/showcase.server";
import { showcaseImageStore as uncletShowcaseImageStore } from "../sites/studio/src/server/content/unclet/showcase-image.server";
import { articleStore as zelglihofArticleStore } from "../sites/studio/src/server/content/zelglihof/article.server";
import { articleImageStore as zelglihofArticleImageStore } from "../sites/studio/src/server/content/zelglihof/article-image.server";
import { campaignStore as zelglihofCampaignStore } from "../sites/studio/src/server/content/zelglihof/campaign.server";
import { inquiryStore as zelglihofInquiryStore } from "../sites/studio/src/server/content/zelglihof/inquiry.server";
import { productStore as zelglihofProductStore } from "../sites/studio/src/server/content/zelglihof/product.server";
import { productReservationStore as zelglihofProductReservationStore } from "../sites/studio/src/server/content/zelglihof/product-reservation.server";
import { productVariantStore as zelglihofProductVariantStore } from "../sites/studio/src/server/content/zelglihof/product-variant.server";
import { promotionStore as zelglihofPromotionStore } from "../sites/studio/src/server/content/zelglihof/promotion.server";
import { subscriberStore as zelglihofSubscriberStore } from "../sites/studio/src/server/content/zelglihof/subscriber.server";

const enabled = Boolean(process.env.STUDIO_TEST_ADMIN_URL);
test("explicit Studio repositories against PostgreSQL migrations", {
	skip: !enabled,
}, async (context) => {
	const admin = createDatabasePool({
		role: "postgres",
		applicationName: "studio-review-tests",
		connectionString: () => process.env.STUDIO_TEST_ADMIN_URL,
	});
	const ids = new Map<string, string>();
	const replacementImageIds = {
		jublawoma: randomUUID(),
		unclet: randomUUID(),
		zelglihof: randomUUID(),
	};
	const imageIds = {
		jublawoma: randomUUID(),
		unclet: randomUUID(),
		zelglihof: randomUUID(),
	};
	const page = { page: 0, size: 30, search: "" };
	const rollback = new Error("Rollback review fixtures");
	try {
		await admin.transaction(async (sql) => {
			for (const [site, id] of [
				...Object.entries(imageIds),
				...Object.entries(replacementImageIds),
			]) {
				await sql`INSERT INTO assets.image (id, site, public, created_at, updated_at) VALUES (${id}, ${site}, false, now(), now())`;
			}
			await sql`SET LOCAL ROLE studio`;
			await context.test(
				"jublawoma.Promotion: typed reads, writes, and identities",
				async () => {
					const store = jublawomaPromotionStore(sql);
					const input = {
						title: "Review title",
						description: "Review description",
						link: "/latest",
						imageId: imageIds.jublawoma,
						startsAt: "2026-01-01T00:00:00Z",
						endsAt: "2027-01-01T00:00:00Z",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.Promotion", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"jublawoma.Story: typed reads, writes, and identities",
				async () => {
					const store = jublawomaStoryStore(sql);
					const input = {
						slug: `review-${randomUUID()}`,
						title: "Review title",
						description: "Review description",
						author: "Review author",
						imageId: imageIds.jublawoma,
						body: "Review body",
						published: false,
						publishedOn: "2026-09-17",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.Story", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"jublawoma.StoryImage: typed reads, writes, and identities",
				async () => {
					const store = jublawomaStoryImageStore(sql);
					const input = {
						storyId: ids.get("jublawoma.Story") ?? "",
						imageId: imageIds.jublawoma,
						description: "Review description",
					};
					const record = await store.create(input);
					const key = { storyId: record.storyId, imageId: record.imageId };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, { story_id: record.storyId });
					assert.ok(
						listed.items.some(
							(row) =>
								row.storyId === record.storyId &&
								row.imageId === record.imageId,
						),
					);
					const updated = await store.update(key, {
						...input,
						description: "Updated",
					});
					assert.equal(updated.description, "Updated");
					const replacementId = replacementImageIds.jublawoma;
					const replaced = await store.update(key, {
						...input,
						imageId: replacementId,
					});
					assert.equal(await store.get(key), null);
					assert.equal(replaced.storyId, record.storyId);
					await store.delete({ ...key, imageId: replacementId });
					assert.equal(
						await store.get({ ...key, imageId: replacementId }),
						null,
					);
				},
			);
			await context.test(
				"jublawoma.Event: typed reads, writes, and identities",
				async () => {
					const store = jublawomaEventStore(sql);
					const input = {
						name: "Review name",
						description: null,
						location: "Review location",
						imageId: imageIds.jublawoma,
						startsOn: "2026-09-17",
						endsOn: "2026-09-17",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.Event", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
				},
			);
			await context.test(
				"jublawoma.Member: typed reads, writes, and identities",
				async () => {
					const store = jublawomaMemberStore(sql);
					const input = {
						name: "Review name",
						imageId: imageIds.jublawoma,
						groupName: "Review groupName",
						leadership: false,
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.Member", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
				},
			);
			await context.test(
				"jublawoma.Donation: typed reads, writes, and identities",
				async () => {
					const store = jublawomaDonationStore(sql);
					const input = {
						title: "Review title",
						description: "Review description",
						contact: "Review contact",
						startsAt: "2026-01-01T00:00:00Z",
						endsAt: "2027-01-01T00:00:00Z",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.Donation", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"jublawoma.DonationItem: typed reads, writes, and identities",
				async () => {
					const store = jublawomaDonationItemStore(sql);
					const input = {
						donationId: ids.get("jublawoma.Donation") ?? "",
						name: "Review name",
						detail: null,
						quantity: 2.5,
						step: 0.5,
						unit: "Review unit",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						donation_id: record.donationId,
					});
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.DonationItem", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
				},
			);
			await context.test(
				"jublawoma.DonationCommitment: typed reads, writes, and identities",
				async () => {
					const store = jublawomaDonationCommitmentStore(sql);
					const [seed] = await sql`
    INSERT INTO ${sql("jublawoma.donation_commitment")} ${sql({
			id: randomUUID(),
			donation_id: ids.get("jublawoma.Donation") ?? "",
			donation_item_id: ids.get("jublawoma.DonationItem") ?? "",
			donation_title: "Review donationTitle",
			item_name: "Review itemName",
			item_detail: null,
			item_quantity: 2.5,
			step: 0.5,
			unit: "Review unit",
			name: "Review name",
			phone: "+41 79 000 00 00",
			quantity: 2.5,
			note: null,

			created_at: new Date(),
			updated_at: new Date(),
		})}
    RETURNING id
   `;
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						donation_id: record.donationId,
					});
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.DonationCommitment", record.id);
				},
			);
			await context.test(
				"unclet.Showcase: typed reads, writes, and identities",
				async () => {
					const store = uncletShowcaseStore(sql);
					const input = {
						slug: `review-${randomUUID()}`,
						title: "Review title",
						location: "Review location",
						guestCount: 3,
						imageId: imageIds.unclet,
						published: false,
						publishedOn: "2026-09-17",
						body: null,
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("unclet.Showcase", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"unclet.ShowcaseImage: typed reads, writes, and identities",
				async () => {
					const store = uncletShowcaseImageStore(sql);
					const input = {
						showcaseId: ids.get("unclet.Showcase") ?? "",
						imageId: imageIds.unclet,
						description: "Review description",
					};
					const record = await store.create(input);
					const key = {
						showcaseId: record.showcaseId,
						imageId: record.imageId,
					};
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						showcase_id: record.showcaseId,
					});
					assert.ok(
						listed.items.some(
							(row) =>
								row.showcaseId === record.showcaseId &&
								row.imageId === record.imageId,
						),
					);
					const updated = await store.update(key, {
						...input,
						description: "Updated",
					});
					assert.equal(updated.description, "Updated");
					const replacementId = replacementImageIds.unclet;
					const replaced = await store.update(key, {
						...input,
						imageId: replacementId,
					});
					assert.equal(await store.get(key), null);
					assert.equal(replaced.showcaseId, record.showcaseId);
					await store.delete({ ...key, imageId: replacementId });
					assert.equal(
						await store.get({ ...key, imageId: replacementId }),
						null,
					);
				},
			);
			await context.test(
				"unclet.Review: typed reads, writes, and identities",
				async () => {
					const store = uncletReviewStore(sql);
					const input = {
						stars: 5,
						name: "Review name",
						description: "Review description",
						visible: false,
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("unclet.Review", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
				},
			);
			await context.test(
				"unclet.Inquiry: typed reads, writes, and identities",
				async () => {
					const store = uncletInquiryStore(sql);
					const [seed] = await sql`
    INSERT INTO ${sql("unclet.inquiry")} ${sql({
			id: randomUUID(),
			status: "new",
			name: "Review name",
			email: `review-${randomUUID()}@example.com`,
			phone: "+41 79 000 00 00",
			event_on: "2026-09-17",
			location: null,
			guest_count: null,
			note: null,

			created_at: new Date(),
			updated_at: new Date(),
		})}
    RETURNING id
   `;
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("unclet.Inquiry", record.id);
					const updated = await store.update(key, { status: "completed" });
					assert.equal(updated.status, "completed");
					assert.equal(updated.name, record.name);
				},
			);
			await context.test(
				"zelglihof.Promotion: typed reads, writes, and identities",
				async () => {
					const store = zelglihofPromotionStore(sql);
					const input = {
						title: "Review title",
						description: "Review description",
						link: "/latest",
						imageId: imageIds.zelglihof,
						startsAt: "2026-01-01T00:00:00Z",
						endsAt: "2027-01-01T00:00:00Z",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Promotion", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"zelglihof.Article: typed reads, writes, and identities",
				async () => {
					const store = zelglihofArticleStore(sql);
					const input = {
						slug: `review-${randomUUID()}`,
						title: "Review title",
						description: "Review description",
						imageId: imageIds.zelglihof,
						body: "Review body",
						published: false,
						publishedOn: "2026-09-17",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Article", record.id);
					const updated = await store.update(key, {
						...input,
						title: "Updated",
					});
					assert.equal(updated.title, "Updated");
				},
			);
			await context.test(
				"zelglihof.ArticleImage: typed reads, writes, and identities",
				async () => {
					const store = zelglihofArticleImageStore(sql);
					const input = {
						articleId: ids.get("zelglihof.Article") ?? "",
						imageId: imageIds.zelglihof,
						description: "Review description",
					};
					const record = await store.create(input);
					const key = { articleId: record.articleId, imageId: record.imageId };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						article_id: record.articleId,
					});
					assert.ok(
						listed.items.some(
							(row) =>
								row.articleId === record.articleId &&
								row.imageId === record.imageId,
						),
					);
					const updated = await store.update(key, {
						...input,
						description: "Updated",
					});
					assert.equal(updated.description, "Updated");
					const replacementId = replacementImageIds.zelglihof;
					const replaced = await store.update(key, {
						...input,
						imageId: replacementId,
					});
					assert.equal(await store.get(key), null);
					assert.equal(replaced.articleId, record.articleId);
					await store.delete({ ...key, imageId: replacementId });
					assert.equal(
						await store.get({ ...key, imageId: replacementId }),
						null,
					);
				},
			);
			await context.test(
				"zelglihof.Product: typed reads, writes, and identities",
				async () => {
					const store = zelglihofProductStore(sql);
					const input = {
						name: "Review name",
						description: "Review description",
						body: "Review body",
						imageId: imageIds.zelglihof,
						visible: false,
						reservable: false,
						startsAt: "2026-01-01T00:00:00Z",
						endsAt: "2027-01-01T00:00:00Z",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Product", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
					await store.update(key, { ...input, name: "100%_fresh" });
					assert.equal(
						(await store.list({ ...page, search: "%_" })).items.length,
						1,
					);
					assert.equal(
						(await store.list({ ...page, search: "' OR true --" })).items
							.length,
						0,
					);
				},
			);
			await context.test(
				"zelglihof.ProductVariant: typed reads, writes, and identities",
				async () => {
					const store = zelglihofProductVariantStore(sql);
					const input = {
						productId: ids.get("zelglihof.Product") ?? "",
						name: "Review name",
						description: null,
						imageId: imageIds.zelglihof,
						price: "Review price",
						quantity: null,
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						product_id: record.productId,
					});
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.ProductVariant", record.id);
					const updated = await store.update(key, {
						...input,
						name: "Updated",
					});
					assert.equal(updated.name, "Updated");
				},
			);
			await context.test(
				"zelglihof.ProductReservation: typed reads, writes, and identities",
				async () => {
					const store = zelglihofProductReservationStore(sql);
					const [seed] = await sql`
    INSERT INTO ${sql("zelglihof.product_reservation")} ${sql({
			id: randomUUID(),
			product_id: ids.get("zelglihof.Product") ?? "",
			product_variant_id: ids.get("zelglihof.ProductVariant") ?? "",
			product_name: "Review productName",
			variant_name: "Review variantName",
			variant_description: null,
			variant_quantity: null,
			variant_price: "Review variantPrice",
			name: "Review name",
			phone: "+41 79 000 00 00",
			email: null,
			quantity: 3,
			note: null,
			status: "new",

			created_at: new Date(),
			updated_at: new Date(),
		})}
    RETURNING id
   `;
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page, {
						product_id: record.productId,
					});
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.ProductReservation", record.id);
					const updated = await store.update(key, { status: "completed" });
					assert.equal(updated.status, "completed");
					assert.equal(updated.name, record.name);
				},
			);
			await context.test(
				"zelglihof.Subscriber: typed reads, writes, and identities",
				async () => {
					const store = zelglihofSubscriberStore(sql);
					const [seed] = await sql`
    INSERT INTO ${sql("zelglihof.subscriber")} ${sql({
			id: randomUUID(),
			email: `review-${randomUUID()}@example.com`,
			status: "pending",
			requested_at: "2026-01-01T00:00:00Z",
			confirmed_at: "2026-01-01T00:00:00Z",
			unsubscribed_at: "2026-01-01T00:00:00Z",
			confirmation_token_hash: randomUUID(),
			unsubscribe_token: randomUUID(),
			created_at: new Date(),
			updated_at: new Date(),
		})}
    RETURNING id
   `;
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Subscriber", record.id);
				},
			);
			await context.test(
				"zelglihof.Campaign: typed reads, writes, and identities",
				async () => {
					const store = zelglihofCampaignStore(sql);
					const input = {
						subject: "Review subject",
						body: "Review body",
					};
					const record = await store.create(input);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Campaign", record.id);
					const updated = await store.update(key, {
						...input,
						subject: "Updated",
					});
					assert.equal(updated.subject, "Updated");
					await sql`UPDATE zelglihof.campaign SET status = 'queued' WHERE id = ${record.id}`;
					await assert.rejects(store.update(key, input), /no longer editable/);
					assert.equal((await store.get(key))?.status, "queued");
				},
			);
			await context.test(
				"zelglihof.Inquiry: typed reads, writes, and identities",
				async () => {
					const store = zelglihofInquiryStore(sql);
					const [seed] = await sql`
    INSERT INTO ${sql("zelglihof.inquiry")} ${sql({
			id: randomUUID(),
			status: "new",
			name: "Review name",
			phone: "+41 79 000 00 00",
			email: null,
			message: "Review message",

			created_at: new Date(),
			updated_at: new Date(),
		})}
    RETURNING id
   `;
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("zelglihof.Inquiry", record.id);
					const updated = await store.update(key, { status: "completed" });
					assert.equal(updated.status, "completed");
					assert.equal(updated.name, record.name);
				},
			);
			await context.test(
				"public reviews remain hidden until moderated",
				async () => {
					const name = `Review ${randomUUID()}`;
					await sql`SET LOCAL ROLE unclet`;
					await createReviewRepository(sql).submit({
						stars: 5,
						name,
						description: "A public submission",
					});
					await sql`SET LOCAL ROLE studio`;
					const [review] =
						await sql`SELECT stars, visible, created_at, updated_at FROM unclet.review WHERE name = ${name}`;
					assert.equal(review.stars, 5);
					assert.equal(review.visible, false);
					assert.ok(review.created_at instanceof Date);
					assert.deepEqual(review.updated_at, review.created_at);
				},
			);
			throw rollback;
		});
	} catch (error) {
		if (error !== rollback) throw error;
	} finally {
		await admin.close();
	}
});
