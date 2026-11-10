import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { eq, sql } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import { createArticleRepository } from "../../packages/zelglihof-data/src/content/article.repository";
import { createArticleImageRepository } from "../../packages/zelglihof-data/src/content/article-image.repository";
import type { CampaignInput } from "../../packages/zelglihof-data/src/content/campaign";
import { createCampaignRepository } from "../../packages/zelglihof-data/src/content/campaign.repository";
import {
	ConcurrentUpdateError,
	RecordKeyMismatchError,
} from "../../packages/zelglihof-data/src/content/errors";
import { createInquiryRepository } from "../../packages/zelglihof-data/src/content/inquiry.repository";
import { createProductRepository } from "../../packages/zelglihof-data/src/content/product.repository";
import { createProductReservationRepository } from "../../packages/zelglihof-data/src/content/product-reservation.repository";
import { createProductVariantRepository } from "../../packages/zelglihof-data/src/content/product-variant.repository";
import { createPromotionRepository } from "../../packages/zelglihof-data/src/content/promotion.repository";
import { createSubscriberRepository } from "../../packages/zelglihof-data/src/content/subscriber.repository";
import * as zelglihof from "../../packages/zelglihof-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	rolledBack,
} from "../support/database";
import {
	advanceUpdatedAt,
	expectRoundTrip,
	setCreatedAt,
} from "../support/repository-assertions";

/*
 * The zelglihof managed-content repositories against real PostgreSQL. The
 * campaign guard, the compare-and-set token, scoped reads and LIKE escaping
 * are SQL predicates, so only a live database proves them. Each test seeds its
 * own rows in a rolled-back transaction: image rows as the migrating role, the
 * repository work under the deployed `studio` role.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

const page = { page: 0, size: 30, search: "" };
const earliest = "2026-01-01T00:00:00.000Z";
const middle = "2026-01-02T00:00:00.000Z";
const latest = "2026-01-03T00:00:00.000Z";

/** The studio role cannot write assets; seed image rows before switching role. */
async function seedImage(transaction: Transaction) {
	const imageId = randomUUID();
	await transaction.execute(
		sql`INSERT INTO assets.image (id, site, public, created_at, updated_at)
			VALUES (${imageId}, 'zelglihof', false, now(), now())`,
	);
	return imageId;
}

function promotionInput(imageId: string) {
	return {
		title: "Review title",
		description: "Review description",
		link: "/latest",
		imageId,
		startsAt: "2026-01-01T00:00:00.000Z",
		endsAt: "2027-01-01T00:00:00.000Z",
	};
}

function articleInput(imageId: string) {
	return {
		slug: `review-${randomUUID()}`,
		title: "Review title",
		description: "Review description",
		imageId,
		body: "Review body",
		published: false,
		publishedOn: "2026-09-17",
	};
}

function productInput(imageId: string) {
	return {
		name: "Review name",
		description: "Review description",
		body: "Review body",
		imageId,
		visible: false,
		reservable: false,
		startsAt: "2026-01-01T00:00:00.000Z",
		endsAt: "2027-01-01T00:00:00.000Z",
	};
}

function variantInput(productId: string, imageId: string) {
	return {
		productId,
		name: "Review name",
		description: null,
		imageId,
		price: "CHF 5",
		quantity: null,
	};
}

test("zelglihof.Promotion round-trips create, read, update and delete", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const input = promotionInput(imageId);
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, title: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.title, "Updated");
			assert.equal(updated.description, input.description);
			assert.equal(updated.createdAt, record.createdAt);

			await store.delete({ id: record.id });
			assert.equal(await store.get({ id: record.id }), null);
		});
	});
});

test("zelglihof.Promotion list returns the newest row first", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const token = `order-${randomUUID()}`;
			const input = promotionInput(imageId);
			const older = await store.create({ ...input, title: `${token} older` });
			const newer = await store.create({ ...input, title: `${token} newer` });
			await setCreatedAt(transaction, zelglihof.promotion, older.id, earliest);
			await setCreatedAt(transaction, zelglihof.promotion, newer.id, latest);

			const listed = await store.list({ ...page, search: token });
			assert.deepEqual(
				listed.items.map((row) => row.id),
				[newer.id, older.id],
			);
		});
	});
});

test("zelglihof.Promotion pages walk the SQL limit and offset", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const token = `page-${randomUUID()}`;
			const input = promotionInput(imageId);
			const oldest = await store.create({ ...input, title: `${token} a` });
			const median = await store.create({ ...input, title: `${token} b` });
			const newest = await store.create({ ...input, title: `${token} c` });
			await setCreatedAt(transaction, zelglihof.promotion, oldest.id, earliest);
			await setCreatedAt(transaction, zelglihof.promotion, median.id, middle);
			await setCreatedAt(transaction, zelglihof.promotion, newest.id, latest);

			const first = await store.list({ page: 0, size: 2, search: token });
			assert.deepEqual(
				first.items.map((row) => row.id),
				[newest.id, median.id],
			);
			assert.equal(first.nextPage, 1);

			const second = await store.list({ page: 1, size: 2, search: token });
			assert.deepEqual(
				second.items.map((row) => row.id),
				[oldest.id],
			);
			assert.equal(second.nextPage, null);
		});
	});
});

test("zelglihof.Article round-trips and updates its title", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createArticleRepository(transaction);
			const input = articleInput(imageId);
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, title: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.title, "Updated");
			assert.equal(updated.publishedOn, input.publishedOn);
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});

test("zelglihof.ArticleImage round-trips on its composite key and rejects re-keying", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const replacementId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const article = await createArticleRepository(transaction).create(
				articleInput(imageId),
			);
			const store = createArticleImageRepository(transaction);
			const input = {
				articleId: article.id,
				imageId,
				description: "Review description",
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				articleId: row.articleId,
				imageId: row.imageId,
			}));
			const key = { articleId: record.articleId, imageId: record.imageId };
			const listed = await store.listForArticle(page, record.articleId);
			assert.ok(
				listed.items.some(
					(row) =>
						row.articleId === record.articleId &&
						row.imageId === record.imageId,
				),
			);

			const updated = await store.update(
				key,
				{ ...input, description: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.description, "Updated");

			// The key is the row's identity: values cannot rename or re-parent it.
			await assert.rejects(
				store.update(
					key,
					{ ...input, imageId: replacementId },
					updated.updatedAt,
				),
				RecordKeyMismatchError,
			);
			assert.notEqual(await store.get(key), null);
			assert.equal(
				await store.get({ articleId: key.articleId, imageId: replacementId }),
				null,
			);
		});
	});
});

test("zelglihof.ArticleImage delete removes only the addressed link", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const siblingId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const article = await createArticleRepository(transaction).create(
				articleInput(imageId),
			);
			const store = createArticleImageRepository(transaction);
			const first = await store.create({
				articleId: article.id,
				imageId,
				description: "First",
			});
			const sibling = await store.create({
				articleId: article.id,
				imageId: siblingId,
				description: "Sibling",
			});

			await store.delete({
				articleId: first.articleId,
				imageId: first.imageId,
			});

			assert.equal(
				await store.get({ articleId: first.articleId, imageId: first.imageId }),
				null,
			);
			assert.notEqual(
				await store.get({
					articleId: sibling.articleId,
					imageId: sibling.imageId,
				}),
				null,
			);
			const listed = await store.listForArticle(page, article.id);
			assert.deepEqual(
				listed.items.map((row) => row.imageId),
				[sibling.imageId],
			);
		});
	});
});

test("zelglihof.Product search keeps LIKE metacharacters literal and refuses deletion", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createProductRepository(transaction);
			const input = productInput(imageId);
			const literal = await store.create({ ...input, name: "100%_fresh" });
			const lookalike = await store.create({ ...input, name: "100XXfresh" });
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === literal.id));

			const found = await store.list({ ...page, search: "%_" });
			assert.ok(found.items.some((row) => row.id === literal.id));
			assert.equal(
				found.items.some((row) => row.id === lookalike.id),
				false,
			);
			assert.equal(
				(await store.list({ ...page, search: "' OR true --" })).items.length,
				0,
			);

			await assert.rejects(
				store.delete({ id: literal.id }),
				/Products cannot be deleted/,
			);
		});
	});
});

test("zelglihof.ProductVariant round-trips, scopes to its product and refuses deletion", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const product = await createProductRepository(transaction).create(
				productInput(imageId),
			);
			const store = createProductVariantRepository(transaction);
			const input = variantInput(product.id, imageId);
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.listForProduct(page, product.id);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, name: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.name, "Updated");

			// A mismatched parent is a key/values mismatch, never a move.
			await assert.rejects(
				store.update(
					{ id: record.id },
					{ ...input, productId: randomUUID() },
					updated.updatedAt,
				),
				RecordKeyMismatchError,
			);
			assert.equal((await store.get({ id: record.id }))?.productId, product.id);
			await assert.rejects(
				store.delete({ id: record.id }),
				/Product variants cannot be deleted/,
			);
		});
	});
});

test("a stale identity-guarded variant update still refuses key mismatches", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const product = await createProductRepository(transaction).create(
				productInput(imageId),
			);
			const store = createProductVariantRepository(transaction);
			const input = variantInput(product.id, imageId);
			const record = await store.create(input);
			const key = { id: record.id };
			const live = await advanceUpdatedAt(
				transaction,
				zelglihof.productVariant,
				record.id,
			);

			// A stale token with a matching identity is the conflict's verdict.
			await assert.rejects(
				store.update(key, { ...input, name: "Stale write" }, record.updatedAt),
				ConcurrentUpdateError,
			);
			// A wrong identity stays the key guard's verdict.
			await assert.rejects(
				store.update(key, { ...input, productId: randomUUID() }, live),
				RecordKeyMismatchError,
			);
			assert.equal((await store.get(key))?.name, input.name);
			const fresh = await store.update(
				key,
				{ ...input, name: "Fresh write" },
				live,
			);
			assert.equal(fresh.name, "Fresh write");
		});
	});
});

test("zelglihof.ProductReservation updates status but keeps the row and its history", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const product = await createProductRepository(transaction).create(
				productInput(imageId),
			);
			const store = createProductReservationRepository(transaction);
			const reservationId = randomUUID();
			const now = new Date().toISOString();
			await transaction.insert(zelglihof.productReservation).values({
				id: reservationId,
				productId: product.id,
				productVariantId: null,
				productName: product.name,
				variantName: "Review variant",
				variantDescription: null,
				variantQuantity: null,
				variantPrice: "CHF 5",
				name: "Review name",
				phone: "+41 79 000 00 00",
				email: null,
				quantity: 3,
				note: null,
				status: "new",
				createdAt: now,
				updatedAt: now,
			});

			const record = await store.get({ id: reservationId });
			assert.ok(record);
			assert.deepEqual(await store.get({ id: reservationId }), record);
			assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
			const listed = await store.listForProduct(page, product.id);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ status: "completed" },
				record.updatedAt,
			);
			assert.equal(updated.status, "completed");
			assert.equal(updated.name, record.name);
			assert.equal(updated.createdAt, record.createdAt);

			await assert.rejects(
				store.update(
					{ id: record.id },
					{ status: "cancelled" },
					updated.updatedAt,
				),
				/dedicated cancellation action/,
			);
			await assert.rejects(
				store.delete({ id: record.id }),
				/Reservation history cannot be deleted/,
			);
		});
	});
});

test("zelglihof.Subscriber reads never expose the confirmation or unsubscribe token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const subscriberId = randomUUID();
		const now = new Date().toISOString();
		await transaction.insert(zelglihof.subscriber).values({
			id: subscriberId,
			email: `review-${randomUUID()}@example.com`,
			status: "pending",
			requestedAt: now,
			confirmedAt: now,
			unsubscribedAt: now,
			confirmationTokenHash: randomUUID(),
			unsubscribeToken: randomUUID(),
			createdAt: now,
			updatedAt: now,
		});
		await asRole(transaction, "studio", async () => {
			const store = createSubscriberRepository(transaction);
			const record = await store.get({ id: subscriberId });
			assert.ok(record);
			assert.equal(Object.hasOwn(record, "confirmationTokenHash"), false);
			assert.equal(Object.hasOwn(record, "unsubscribeToken"), false);
			assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);

			const listed = await store.list(page);
			const listedRecord = listed.items.find((row) => row.id === record.id);
			assert.ok(listedRecord);
			assert.equal(Object.hasOwn(listedRecord, "confirmationTokenHash"), false);
			assert.equal(Object.hasOwn(listedRecord, "unsubscribeToken"), false);
		});
	});
});

test("zelglihof.Campaign round-trips with the guard keeping it a draft", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createCampaignRepository(transaction);
			const input = { subject: "Review subject", body: "Review body" };
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			assert.equal(record.status, "draft");
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, subject: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.subject, "Updated");
			assert.equal(updated.createdAt, record.createdAt);

			// CampaignInput carries no status; a caller that sends one anyway
			// must not be able to move the row out of the guard's state.
			const claimed = await store.update(
				{ id: record.id },
				{
					...input,
					subject: "Claimed",
					status: "queued",
				} as unknown as CampaignInput,
				updated.updatedAt,
			);
			assert.equal(claimed.status, "draft");
			assert.equal((await store.get({ id: record.id }))?.status, "draft");
		});
	});
});

test("zelglihof.Campaign update advances the concurrency token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createCampaignRepository(transaction);
			const input = { subject: "Review subject", body: "Review body" };
			const record = await store.create(input);
			const key = { id: record.id };
			const live = await advanceUpdatedAt(
				transaction,
				zelglihof.campaign,
				record.id,
			);

			await assert.rejects(
				store.update(key, { ...input, subject: "Stale" }, record.updatedAt),
				ConcurrentUpdateError,
			);
			const updated = await store.update(
				key,
				{ ...input, subject: "Fresh" },
				live,
			);
			assert.notEqual(updated.updatedAt, live);
			assert.equal(updated.status, "draft");

			await assert.rejects(
				store.update(key, { ...input, subject: "Replay" }, live),
				ConcurrentUpdateError,
			);
			const again = await store.update(
				key,
				{ ...input, subject: "Fresh again" },
				updated.updatedAt,
			);
			assert.equal(again.subject, "Fresh again");
		});
	});
});

test("a queued campaign is neither editable nor deletable", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createCampaignRepository(transaction);
			const input = { subject: "Review subject", body: "Review body" };
			const record = await store.create(input);
			const key = { id: record.id };
			await transaction
				.update(zelglihof.campaign)
				.set({ status: "queued" })
				.where(eq(zelglihof.campaign.id, record.id));

			// The token is current; the guard, not the token, refuses the write.
			await assert.rejects(
				store.update(key, input, record.updatedAt),
				/no longer editable/,
			);
			assert.equal((await store.get(key))?.status, "queued");
			await assert.rejects(
				store.delete(key),
				/Only draft campaigns can be deleted/,
			);

			await transaction
				.update(zelglihof.campaign)
				.set({ status: "draft" })
				.where(eq(zelglihof.campaign.id, record.id));
			await store.delete(key);
			assert.equal(await store.get(key), null);
		});
	});
});

test("zelglihof.Inquiry status update preserves the rest of the row", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const inquiryId = randomUUID();
		const createdAt = new Date().toISOString();
		await transaction.insert(zelglihof.inquiry).values({
			id: inquiryId,
			status: "new",
			subject: "other",
			name: "Review name",
			phone: "+41 79 000 00 00",
			email: null,
			message: "Review message",
			createdAt,
			updatedAt: createdAt,
		});
		await asRole(transaction, "studio", async () => {
			const store = createInquiryRepository(transaction);
			const record = await store.get({ id: inquiryId });
			assert.ok(record);
			assert.deepEqual(await store.get({ id: inquiryId }), record);
			assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ status: "completed" },
				record.updatedAt,
			);
			assert.equal(updated.status, "completed");
			assert.equal(updated.name, record.name);
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});
