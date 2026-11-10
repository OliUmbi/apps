import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { sql } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import { createDonationRepository } from "../../packages/jublawoma-data/src/content/donation.repository";
import { createDonationCommitmentRepository } from "../../packages/jublawoma-data/src/content/donation-commitment.repository";
import { createDonationItemRepository } from "../../packages/jublawoma-data/src/content/donation-item.repository";
import {
	ConcurrentUpdateError,
	RecordKeyMismatchError,
} from "../../packages/jublawoma-data/src/content/errors";
import { createEventRepository } from "../../packages/jublawoma-data/src/content/event.repository";
import { createMemberRepository } from "../../packages/jublawoma-data/src/content/member.repository";
import { createPromotionRepository } from "../../packages/jublawoma-data/src/content/promotion.repository";
import { createStoryRepository } from "../../packages/jublawoma-data/src/content/story.repository";
import { createStoryImageRepository } from "../../packages/jublawoma-data/src/content/story-image.repository";
import * as jublawoma from "../../packages/jublawoma-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	rolledBack,
} from "../support/database";
import { seedDonation } from "../support/fixtures";
import {
	advanceUpdatedAt,
	expectRoundTrip,
	setCreatedAt,
} from "../support/repository-assertions";

/*
 * The jublawoma managed-content repositories against real PostgreSQL. Ordering,
 * pagination, LIKE escaping and the compare-and-set token are SQL, so only a
 * live database proves them. Every test seeds its own rows inside a rolled-back
 * transaction: image rows first as the migrating role, then the reads and
 * writes under the deployed `studio` role.
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
			VALUES (${imageId}, 'jublawoma', false, now(), now())`,
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

function storyInput(imageId: string) {
	return {
		slug: `review-${randomUUID()}`,
		title: "Review title",
		description: "Review description",
		author: "Review author",
		imageId,
		body: "Review body",
		published: false,
		publishedOn: "2026-09-17",
	};
}

test("jublawoma.Promotion round-trips create, read, update and delete", {
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
			// Only the changed field and updatedAt move; the rest stay put.
			assert.equal(updated.description, input.description);
			assert.equal(updated.imageId, input.imageId);
			assert.equal(updated.createdAt, record.createdAt);

			await store.delete({ id: record.id });
			assert.equal(await store.get({ id: record.id }), null);
		});
	});
});

test("jublawoma.Promotion update advances the concurrency token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const input = promotionInput(imageId);
			const record = await store.create(input);
			const key = { id: record.id };

			// A faster editor saved after this record was loaded.
			const live = await advanceUpdatedAt(
				transaction,
				jublawoma.promotion,
				record.id,
			);
			await assert.rejects(
				store.update(key, { ...input, title: "Stale write" }, record.updatedAt),
				ConcurrentUpdateError,
			);
			// The refused write left the row untouched.
			assert.equal((await store.get(key))?.title, input.title);

			const updated = await store.update(
				key,
				{ ...input, title: "Fresh write" },
				live,
			);
			assert.notEqual(updated.updatedAt, live);
			assert.equal(updated.title, "Fresh write");

			// The token that just saved is spent; the returned one is live.
			await assert.rejects(
				store.update(key, { ...input, title: "Replay" }, live),
				ConcurrentUpdateError,
			);
			const again = await store.update(
				key,
				{ ...input, title: "Fresh again" },
				updated.updatedAt,
			);
			assert.equal(again.title, "Fresh again");
		});
	});
});

test("jublawoma.Promotion list returns the newest row first", {
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
			await setCreatedAt(transaction, jublawoma.promotion, older.id, earliest);
			await setCreatedAt(transaction, jublawoma.promotion, newer.id, latest);

			const listed = await store.list({ ...page, search: token });
			assert.deepEqual(
				listed.items.map((row) => row.id),
				[newer.id, older.id],
			);
		});
	});
});

test("jublawoma.Promotion pages walk the SQL limit and offset", {
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
			await setCreatedAt(transaction, jublawoma.promotion, oldest.id, earliest);
			await setCreatedAt(transaction, jublawoma.promotion, median.id, middle);
			await setCreatedAt(transaction, jublawoma.promotion, newest.id, latest);

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

test("jublawoma.Promotion search keeps LIKE metacharacters literal", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const input = promotionInput(imageId);
			const literal = await store.create({ ...input, title: "100%_fresh" });
			const lookalike = await store.create({ ...input, title: "100XXfresh" });

			const found = await store.list({ ...page, search: "%_" });
			assert.ok(found.items.some((row) => row.id === literal.id));
			assert.equal(
				found.items.some((row) => row.id === lookalike.id),
				false,
			);
		});
	});
});

test("jublawoma.Story round-trips and keeps its publication fields", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createStoryRepository(transaction);
			const input = storyInput(imageId);
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			assert.equal(record.publishedOn, "2026-09-17");
			assert.equal(record.createdAt, new Date(record.createdAt).toISOString());
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, title: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.title, "Updated");
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});

test("jublawoma.StoryImage round-trips on its composite key and rejects re-keying", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const replacementId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const stories = createStoryRepository(transaction);
			const story = await stories.create(storyInput(imageId));
			const store = createStoryImageRepository(transaction);
			const input = {
				storyId: story.id,
				imageId,
				description: "Review description",
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				storyId: row.storyId,
				imageId: row.imageId,
			}));
			const key = { storyId: record.storyId, imageId: record.imageId };
			const listed = await store.listForStory(page, record.storyId);
			assert.ok(
				listed.items.some(
					(row) =>
						row.storyId === record.storyId && row.imageId === record.imageId,
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
				await store.get({ storyId: key.storyId, imageId: replacementId }),
				null,
			);
		});
	});
});

test("jublawoma.StoryImage delete removes only the addressed link", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		const siblingId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const story = await createStoryRepository(transaction).create(
				storyInput(imageId),
			);
			const store = createStoryImageRepository(transaction);
			const first = await store.create({
				storyId: story.id,
				imageId,
				description: "First",
			});
			const sibling = await store.create({
				storyId: story.id,
				imageId: siblingId,
				description: "Sibling",
			});

			await store.delete({
				storyId: first.storyId,
				imageId: first.imageId,
			});

			assert.equal(
				await store.get({ storyId: first.storyId, imageId: first.imageId }),
				null,
			);
			assert.notEqual(
				await store.get({
					storyId: sibling.storyId,
					imageId: sibling.imageId,
				}),
				null,
			);
			const listed = await store.listForStory(page, story.id);
			assert.deepEqual(
				listed.items.map((row) => row.imageId),
				[sibling.imageId],
			);
		});
	});
});

test("jublawoma.Event round-trips and updates its name", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createEventRepository(transaction);
			const input = {
				name: "Review name",
				description: null,
				location: "Review location",
				imageId,
				startsOn: "2026-09-17",
				endsOn: "2026-09-17",
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, name: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.name, "Updated");
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});

test("jublawoma.Member round-trips and updates its name", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createMemberRepository(transaction);
			const input = {
				name: "Review name",
				imageId,
				groupName: "Review group",
				leadership: false,
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));

			const updated = await store.update(
				{ id: record.id },
				{ ...input, name: "Updated" },
				record.updatedAt,
			);
			assert.equal(updated.name, "Updated");
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});

test("jublawoma.Donation round-trips and updates its title", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createDonationRepository(transaction);
			const input = {
				title: "Review title",
				description: "Review description",
				contact: "Review contact",
				startsAt: "2026-01-01T00:00:00.000Z",
				endsAt: "2027-01-01T00:00:00.000Z",
			};
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
			assert.equal(updated.createdAt, record.createdAt);
		});
	});
});

test("jublawoma.DonationItem round-trips, lists by donation and rejects re-parenting", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		await asRole(transaction, "studio", async () => {
			const store = createDonationItemRepository(transaction);
			const input = {
				donationId: seed.donationId,
				name: "Review name",
				detail: null,
				quantity: "2.5",
				step: "0.5",
				unit: "Review unit",
			};
			const record = await expectRoundTrip(store, input, (row) => ({
				id: row.id,
			}));
			const listed = await store.listForDonation(page, seed.donationId);
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
					{ ...input, donationId: randomUUID() },
					updated.updatedAt,
				),
				RecordKeyMismatchError,
			);
			assert.equal(
				(await store.get({ id: record.id }))?.donationId,
				input.donationId,
			);
		});
	});
});

test("jublawoma.DonationCommitment reads seeded rows globally and by donation", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		const commitmentId = randomUUID();
		const now = new Date().toISOString();
		await asRole(transaction, "studio", async () => {
			// The workflow writes commitments; the manager only ever reads them.
			await transaction.insert(jublawoma.donationCommitment).values({
				id: commitmentId,
				donationId: seed.donationId,
				donationItemId: seed.itemId,
				donationTitle: "Review donationTitle",
				itemName: "Review itemName",
				itemDetail: null,
				itemQuantity: "2.5",
				step: "0.5",
				unit: "Review unit",
				name: "Review name",
				phone: "+41 79 000 00 00",
				quantity: "2.5",
				note: null,
				createdAt: now,
				updatedAt: now,
			});
			const store = createDonationCommitmentRepository(transaction);
			const record = await store.get({ id: commitmentId });
			assert.ok(record);
			assert.deepEqual(await store.get({ id: commitmentId }), record);
			assert.match(record.createdAt, /^\d{4}-\d{2}-\d{2}T/);

			const listed = await store.list(page);
			assert.ok(listed.items.some((row) => row.id === record.id));
			const scoped = await store.listForDonation(page, seed.donationId);
			assert.ok(scoped.items.some((row) => row.id === record.id));
		});
	});
});
