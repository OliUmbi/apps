import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { eq, sql } from "drizzle-orm";
import { createDatabasePool } from "../packages/database/src";
import { createDonationRepository as jublawomaDonationStore } from "../packages/jublawoma-data/src/content/donation.repository";
import { createDonationCommitmentRepository as jublawomaDonationCommitmentStore } from "../packages/jublawoma-data/src/content/donation-commitment.repository";
import { createDonationItemRepository as jublawomaDonationItemStore } from "../packages/jublawoma-data/src/content/donation-item.repository";
import { createEventRepository as jublawomaEventStore } from "../packages/jublawoma-data/src/content/event.repository";
import { createMemberRepository as jublawomaMemberStore } from "../packages/jublawoma-data/src/content/member.repository";
import { createPromotionRepository as jublawomaPromotionStore } from "../packages/jublawoma-data/src/content/promotion.repository";
import { createStoryRepository as jublawomaStoryStore } from "../packages/jublawoma-data/src/content/story.repository";
import { createStoryImageRepository as jublawomaStoryImageStore } from "../packages/jublawoma-data/src/content/story-image.repository";
import * as jublawoma from "../packages/jublawoma-data/src/schema";
import { createInquiryRepository as uncletInquiryStore } from "../packages/unclet-data/src/content/inquiry.repository";
import { createReviewRepository as uncletReviewStore } from "../packages/unclet-data/src/content/review.repository";
import { createShowcaseRepository as uncletShowcaseStore } from "../packages/unclet-data/src/content/showcase.repository";
import { createShowcaseImageRepository as uncletShowcaseImageStore } from "../packages/unclet-data/src/content/showcase-image.repository";
import { createReviewRepository } from "../packages/unclet-data/src/review.repository";
import * as unclet from "../packages/unclet-data/src/schema";
import { createArticleRepository as zelglihofArticleStore } from "../packages/zelglihof-data/src/content/article.repository";
import { createArticleImageRepository as zelglihofArticleImageStore } from "../packages/zelglihof-data/src/content/article-image.repository";
import { createCampaignRepository as zelglihofCampaignStore } from "../packages/zelglihof-data/src/content/campaign.repository";
import { createInquiryRepository as zelglihofInquiryStore } from "../packages/zelglihof-data/src/content/inquiry.repository";
import { createProductRepository as zelglihofProductStore } from "../packages/zelglihof-data/src/content/product.repository";
import { createProductReservationRepository as zelglihofProductReservationStore } from "../packages/zelglihof-data/src/content/product-reservation.repository";
import { createProductVariantRepository as zelglihofProductVariantStore } from "../packages/zelglihof-data/src/content/product-variant.repository";
import { createPromotionRepository as zelglihofPromotionStore } from "../packages/zelglihof-data/src/content/promotion.repository";
import { createSubscriberRepository as zelglihofSubscriberStore } from "../packages/zelglihof-data/src/content/subscriber.repository";
import * as zelglihof from "../packages/zelglihof-data/src/schema";

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
		await admin.transaction(async (transaction) => {
			for (const [site, id] of [
				...Object.entries(imageIds),
				...Object.entries(replacementImageIds),
			]) {
				await transaction.execute(
					sql`INSERT INTO assets.image (id, site, public, created_at, updated_at) VALUES (${id}, ${site}, false, now(), now())`,
				);
			}
			await transaction.execute(sql`SET LOCAL ROLE studio`);
			await context.test(
				"jublawoma.Promotion: typed reads, writes, and identities",
				async () => {
					const store = jublawomaPromotionStore(transaction);
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
					const store = jublawomaStoryStore(transaction);
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
					assert.equal(record.publishedOn, "2026-09-17");
					assert.equal(
						record.createdAt,
						new Date(record.createdAt).toISOString(),
					);
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
					const store = jublawomaStoryImageStore(transaction);
					const input = {
						storyId: ids.get("jublawoma.Story") ?? "",
						imageId: imageIds.jublawoma,
						description: "Review description",
					};
					const record = await store.create(input);
					const key = { storyId: record.storyId, imageId: record.imageId };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.listForStory(page, record.storyId ?? "");
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
					const store = jublawomaEventStore(transaction);
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
					const store = jublawomaMemberStore(transaction);
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
					const store = jublawomaDonationStore(transaction);
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
					const store = jublawomaDonationItemStore(transaction);
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
					const listed = await store.listForDonation(
						page,
						record.donationId ?? "",
					);
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
					const store = jublawomaDonationCommitmentStore(transaction);
					const [seed] = await transaction
						.insert(jublawoma.donationCommitment)
						.values({
							id: randomUUID(),
							donationId: ids.get("jublawoma.Donation") ?? "",
							donationItemId: ids.get("jublawoma.DonationItem") ?? "",
							donationTitle: "Review donationTitle",
							itemName: "Review itemName",
							itemDetail: null,
							itemQuantity: 2.5,
							step: 0.5,
							unit: "Review unit",
							name: "Review name",
							phone: "+41 79 000 00 00",
							quantity: 2.5,
							note: null,

							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						})
						.returning({ id: jublawoma.donationCommitment.id });
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.listForDonation(
						page,
						record.donationId ?? "",
					);
					assert.ok(listed.items.some((row) => row.id === record.id));
					ids.set("jublawoma.DonationCommitment", record.id);
				},
			);
			await context.test(
				"unclet.Showcase: typed reads, writes, and identities",
				async () => {
					const store = uncletShowcaseStore(transaction);
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
					const store = uncletShowcaseImageStore(transaction);
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
					const listed = await store.listForShowcase(
						page,
						record.showcaseId ?? "",
					);
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
					const store = uncletReviewStore(transaction);
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
					const store = uncletInquiryStore(transaction);
					const [seed] = await transaction
						.insert(unclet.inquiry)
						.values({
							id: randomUUID(),
							status: "new",
							name: "Review name",
							email: `review-${randomUUID()}@example.com`,
							phone: "+41 79 000 00 00",
							eventOn: "2026-09-17",
							location: null,
							guestCount: null,
							note: null,

							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						})
						.returning({ id: unclet.inquiry.id });
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
					const store = zelglihofPromotionStore(transaction);
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
					const store = zelglihofArticleStore(transaction);
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
					const store = zelglihofArticleImageStore(transaction);
					const input = {
						articleId: ids.get("zelglihof.Article") ?? "",
						imageId: imageIds.zelglihof,
						description: "Review description",
					};
					const record = await store.create(input);
					const key = { articleId: record.articleId, imageId: record.imageId };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.listForArticle(
						page,
						record.articleId ?? "",
					);
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
					const store = zelglihofProductStore(transaction);
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
					const store = zelglihofProductVariantStore(transaction);
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
					const listed = await store.listForProduct(
						page,
						record.productId ?? "",
					);
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
					const store = zelglihofProductReservationStore(transaction);
					const [seed] = await transaction
						.insert(zelglihof.productReservation)
						.values({
							id: randomUUID(),
							productId: ids.get("zelglihof.Product") ?? "",
							productVariantId: ids.get("zelglihof.ProductVariant") ?? "",
							productName: "Review productName",
							variantName: "Review variantName",
							variantDescription: null,
							variantQuantity: null,
							variantPrice: "Review variantPrice",
							name: "Review name",
							phone: "+41 79 000 00 00",
							email: null,
							quantity: 3,
							note: null,
							status: "new",

							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						})
						.returning({ id: zelglihof.productReservation.id });
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.listForProduct(
						page,
						record.productId ?? "",
					);
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
					const store = zelglihofSubscriberStore(transaction);
					const [seed] = await transaction
						.insert(zelglihof.subscriber)
						.values({
							id: randomUUID(),
							email: `review-${randomUUID()}@example.com`,
							status: "pending",
							requestedAt: "2026-01-01T00:00:00Z",
							confirmedAt: "2026-01-01T00:00:00Z",
							unsubscribedAt: "2026-01-01T00:00:00Z",
							confirmationTokenHash: randomUUID(),
							unsubscribeToken: randomUUID(),
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						})
						.returning({ id: zelglihof.subscriber.id });
					const record = await store.get({ id: String(seed.id) });
					assert.ok(record);
					const key = { id: record.id };
					assert.deepEqual(await store.get(key), record);
					assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
					const listed = await store.list(page);
					assert.ok(listed.items.some((row) => row.id === record.id));
					assert.equal(Object.hasOwn(record, "confirmationTokenHash"), false);
					assert.equal(Object.hasOwn(record, "unsubscribeToken"), false);
					assert.equal(
						listed.items.some(
							(item) =>
								Object.hasOwn(item, "unsubscribeToken") ||
								Object.hasOwn(item, "confirmationTokenHash"),
						),
						false,
					);
					ids.set("zelglihof.Subscriber", record.id);
				},
			);
			await context.test(
				"zelglihof.Campaign: typed reads, writes, and identities",
				async () => {
					const store = zelglihofCampaignStore(transaction);
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
					await transaction
						.update(zelglihof.campaign)
						.set({ status: "queued" })
						.where(eq(zelglihof.campaign.id, record.id));
					await assert.rejects(store.update(key, input), /no longer editable/);
					assert.equal((await store.get(key))?.status, "queued");
				},
			);
			await context.test(
				"zelglihof.Inquiry: typed reads, writes, and identities",
				async () => {
					const store = zelglihofInquiryStore(transaction);
					const [seed] = await transaction
						.insert(zelglihof.inquiry)
						.values({
							id: randomUUID(),
							status: "new",
							name: "Review name",
							phone: "+41 79 000 00 00",
							email: null,
							message: "Review message",

							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						})
						.returning({ id: zelglihof.inquiry.id });
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
					await transaction.execute(sql`SET LOCAL ROLE unclet`);
					await createReviewRepository(transaction).submit({
						stars: 5,
						name,
						description: "A public submission",
					});
					await transaction.execute(sql`SET LOCAL ROLE studio`);
					const [review] = await transaction
						.select()
						.from(unclet.review)
						.where(eq(unclet.review.name, name));
					assert.equal(review.stars, 5);
					assert.equal(review.visible, false);
					assert.equal(
						review.createdAt,
						new Date(review.createdAt).toISOString(),
					);
					assert.deepEqual(review.updatedAt, review.createdAt);
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
