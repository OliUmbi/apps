import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { eq, sql } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import {
	ConcurrentUpdateError,
	RecordKeyMismatchError,
} from "../../packages/unclet-data/src/content/errors";
import { createInquiryRepository } from "../../packages/unclet-data/src/content/inquiry.repository";
import { createReviewRepository } from "../../packages/unclet-data/src/content/review.repository";
import { createShowcaseRepository } from "../../packages/unclet-data/src/content/showcase.repository";
import { createShowcaseImageRepository } from "../../packages/unclet-data/src/content/showcase-image.repository";
import { createReviewSubmissionRepository } from "../../packages/unclet-data/src/review.repository";
import * as unclet from "../../packages/unclet-data/src/schema";
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
 * The unclet managed-content repositories against real PostgreSQL. The public
 * review form's idempotent write is included because only a live unique index
 * and the hidden-until-moderated default prove it. Each test runs in a
 * rolled-back transaction and seeds its own rows.
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
			VALUES (${imageId}, 'unclet', false, now(), now())`,
	);
	return imageId;
}

function showcaseInput(imageId: string) {
	return {
		slug: `review-${randomUUID()}`,
		title: "Review title",
		location: "Review location",
		guestCount: 3,
		imageId,
		published: false,
		publishedOn: "2026-09-17",
		body: null,
	};
}

function reviewInput() {
	return {
		stars: 5,
		name: "Review name",
		description: "Review description",
		visible: false,
	};
}

test("unclet.Showcase round-trips and preserves fields it does not write", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createShowcaseRepository(transaction);
			const input = showcaseInput(imageId);
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
			assert.equal(updated.location, input.location);
			assert.equal(updated.createdAt, record.createdAt);

			await store.delete({ id: record.id });
			assert.equal(await store.get({ id: record.id }), null);
		});
	});
});

test("unclet.ShowcaseImage round-trips on its composite key and rejects re-keying", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const replacementId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const showcase = await createShowcaseRepository(transaction).create(
				showcaseInput(imageId),
			);
			const store = createShowcaseImageRepository(transaction);
			const input = {
				showcaseId: showcase.id,
				imageId,
				description: "Review description",
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				showcaseId: row.showcaseId,
				imageId: row.imageId,
			}));
			const key = {
				showcaseId: record.showcaseId,
				imageId: record.imageId,
			};
			const listed = await store.listForShowcase(page, record.showcaseId);
			assert.ok(
				listed.items.some(
					(row) =>
						row.showcaseId === record.showcaseId &&
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
				await store.get({
					showcaseId: key.showcaseId,
					imageId: replacementId,
				}),
				null,
			);
		});
	});
});

test("unclet.ShowcaseImage delete removes only the addressed link", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const siblingId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const showcase = await createShowcaseRepository(transaction).create(
				showcaseInput(imageId),
			);
			const store = createShowcaseImageRepository(transaction);
			const first = await store.create({
				showcaseId: showcase.id,
				imageId,
				description: "First",
			});
			const sibling = await store.create({
				showcaseId: showcase.id,
				imageId: siblingId,
				description: "Sibling",
			});

			await store.delete({
				showcaseId: first.showcaseId,
				imageId: first.imageId,
			});

			assert.equal(
				await store.get({
					showcaseId: first.showcaseId,
					imageId: first.imageId,
				}),
				null,
			);
			assert.notEqual(
				await store.get({
					showcaseId: sibling.showcaseId,
					imageId: sibling.imageId,
				}),
				null,
			);
			const listed = await store.listForShowcase(page, showcase.id);
			assert.deepEqual(
				listed.items.map((row) => row.imageId),
				[sibling.imageId],
			);
		});
	});
});

test("unclet.Review round-trips, moderates and never exposes the submission id", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createReviewRepository(transaction);
			const record = await expectRoundTrip(store, reviewInput(), (row) => ({
				id: row.id,
			}));
			// The public form's idempotency key stays on the storage row only.
			assert.equal(Object.hasOwn(record, "submissionId"), false);
			const listed = await store.list(page);
			const listedRecord = listed.items.find((row) => row.id === record.id);
			assert.ok(listedRecord);
			assert.equal(Object.hasOwn(listedRecord, "submissionId"), false);

			const updated = await store.update(
				{ id: record.id },
				{ ...reviewInput(), visible: true },
				record.updatedAt,
			);
			assert.equal(updated.visible, true);
			assert.equal(updated.createdAt, record.createdAt);

			await store.delete({ id: record.id });
			assert.equal(await store.get({ id: record.id }), null);
		});
	});
});

test("unclet.Review pages walk the SQL limit and offset", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createReviewRepository(transaction);
			const token = `page-${randomUUID()}`;
			const input = reviewInput();
			const oldest = await store.create({ ...input, name: `${token} a` });
			const median = await store.create({ ...input, name: `${token} b` });
			const newest = await store.create({ ...input, name: `${token} c` });
			await setCreatedAt(transaction, unclet.review, oldest.id, earliest);
			await setCreatedAt(transaction, unclet.review, median.id, middle);
			await setCreatedAt(transaction, unclet.review, newest.id, latest);

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

test("unclet.Review search keeps LIKE metacharacters literal", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createReviewRepository(transaction);
			const input = reviewInput();
			const literal = await store.create({ ...input, name: "100%_fresh" });
			const lookalike = await store.create({ ...input, name: "100XXfresh" });

			const found = await store.list({ ...page, search: "%_" });
			assert.ok(found.items.some((row) => row.id === literal.id));
			assert.equal(
				found.items.some((row) => row.id === lookalike.id),
				false,
			);
		});
	});
});

test("unclet.Inquiry list returns the newest seeded row first", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const token = `order-${randomUUID()}`;
			const olderId = randomUUID();
			const newerId = randomUUID();
			await transaction.insert(unclet.inquiry).values([
				{
					id: olderId,
					status: "new",
					name: `${token} older`,
					email: `older-${randomUUID()}@example.com`,
					phone: "+41 79 000 00 00",
					createdAt: earliest,
					updatedAt: earliest,
				},
				{
					id: newerId,
					status: "new",
					name: `${token} newer`,
					email: `newer-${randomUUID()}@example.com`,
					phone: "+41 79 000 00 00",
					createdAt: latest,
					updatedAt: latest,
				},
			]);

			const store = createInquiryRepository(transaction);
			const listed = await store.list({ ...page, search: token });
			assert.deepEqual(
				listed.items.map((row) => row.id),
				[newerId, olderId],
			);
		});
	});
});

test("unclet.Inquiry status update preserves the rest of the row", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const inquiryId = randomUUID();
		const createdAt = new Date().toISOString();
		await transaction.insert(unclet.inquiry).values({
			id: inquiryId,
			status: "new",
			name: "Review name",
			email: `review-${randomUUID()}@example.com`,
			phone: "+41 79 000 00 00",
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

			// The input carries status only, so nothing else may change.
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

test("unclet.Inquiry stale token conflicts before the row is touched", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const inquiryId = randomUUID();
		const createdAt = new Date().toISOString();
		await transaction.insert(unclet.inquiry).values({
			id: inquiryId,
			status: "new",
			name: "Review name",
			email: `review-${randomUUID()}@example.com`,
			phone: "+41 79 000 00 00",
			createdAt,
			updatedAt: createdAt,
		});
		await asRole(transaction, "studio", async () => {
			const store = createInquiryRepository(transaction);
			const record = await store.get({ id: inquiryId });
			assert.ok(record);
			const live = await advanceUpdatedAt(
				transaction,
				unclet.inquiry,
				inquiryId,
			);

			await assert.rejects(
				store.update(
					{ id: inquiryId },
					{ status: "completed" },
					record.updatedAt,
				),
				ConcurrentUpdateError,
			);
			const updated = await store.update(
				{ id: inquiryId },
				{ status: "completed" },
				live,
			);
			assert.notEqual(updated.updatedAt, live);
			assert.equal(updated.status, "completed");
			assert.equal((await store.get({ id: inquiryId }))?.status, "completed");
		});
	});
});

test("public reviews stay hidden until moderated and submit once", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const name = `Review ${randomUUID()}`;
		const input = {
			stars: 5,
			name,
			description: "A public submission",
			submissionId: randomUUID(),
		};
		await asRole(transaction, "unclet", async () => {
			const submissions = createReviewSubmissionRepository(transaction);
			await submissions.submit(input);
			// The unique submission id makes the replayed fill a no-op.
			await submissions.submit(input);
		});

		await asRole(transaction, "studio", async () => {
			const reviews = await transaction
				.select()
				.from(unclet.review)
				.where(eq(unclet.review.name, name));
			assert.equal(reviews.length, 1);
			const [review] = reviews;
			assert.equal(review.stars, 5);
			assert.equal(review.visible, false);
			assert.equal(review.submissionId, input.submissionId);
			assert.equal(review.createdAt, new Date(review.createdAt).toISOString());
			assert.deepEqual(review.updatedAt, review.createdAt);
		});
	});
});
