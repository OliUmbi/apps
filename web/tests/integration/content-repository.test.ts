import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { eq, sql } from "drizzle-orm";
import { errorCode } from "../../packages/contracts/src";
import type { Transaction } from "../../packages/database/src";
import { createArticleRepository } from "../../packages/zelglihof-data/src/content/article.repository";
import { createCampaignRepository } from "../../packages/zelglihof-data/src/content/campaign.repository";
import { createProductRepository } from "../../packages/zelglihof-data/src/content/product.repository";
import { createProductVariantRepository } from "../../packages/zelglihof-data/src/content/product-variant.repository";
import { createPromotionRepository } from "../../packages/zelglihof-data/src/content/promotion.repository";
import * as zelglihof from "../../packages/zelglihof-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	rolledBack,
} from "../support/database";
import { advanceUpdatedAt } from "../support/repository-assertions";

/*
 * The generic content-repository factory exercised through a real site
 * repository: the spec fields (scope, guard, compare-and-set token) become SQL
 * here, so the factory's contracts are only proven against PostgreSQL. The
 * factory itself never names a site table; this suite picks zelglihof ones.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

const page = { page: 0, size: 30, search: "" };

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
		startsAt: "2026-01-01T00:00:00Z",
		endsAt: "2027-01-01T00:00:00Z",
	};
}

test("get returns null for a key that matches no row", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createArticleRepository(transaction);
			assert.equal(await store.get({ id: randomUUID() }), null);
		});
	});
});

test("listScoped returns only the addressed parent's rows", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const products = createProductRepository(transaction);
			const first = await products.create({
				name: "Review product",
				description: "Review description",
				body: "Review body",
				imageId,
				visible: false,
				reservable: false,
				startsAt: null,
				endsAt: null,
			});
			const second = await products.create({
				name: "Other product",
				description: "Review description",
				body: "Review body",
				imageId,
				visible: false,
				reservable: false,
				startsAt: null,
				endsAt: null,
			});
			const variants = createProductVariantRepository(transaction);
			const variant = await variants.create({
				productId: first.id,
				name: "Review variant",
				description: null,
				imageId,
				price: "CHF 5",
				quantity: null,
			});

			const own = await variants.listForProduct(page, first.id);
			assert.ok(own.items.some((row) => row.id === variant.id));
			const other = await variants.listForProduct(page, second.id);
			assert.equal(
				other.items.some((row) => row.id === variant.id),
				false,
			);
			assert.ok(
				other.items.every((row) => row.productId === second.id),
				"another parent's rows leaked into the scoped list",
			);
		});
	});
});

test("update misses separate a missing row from a stale token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const imageId = await seedImage(transaction);
		await asRole(transaction, "studio", async () => {
			const store = createPromotionRepository(transaction);
			const input = promotionInput(imageId);
			const missing = { id: randomUUID() };
			await assert.rejects(
				store.update(missing, input, new Date().toISOString()),
				(error: unknown) => {
					assert.equal(errorCode(error), "not-found");
					return true;
				},
			);

			const record = await store.create(input);
			const live = await advanceUpdatedAt(
				transaction,
				zelglihof.promotion,
				record.id,
			);
			await assert.rejects(
				store.update({ id: record.id }, input, record.updatedAt),
				(error: unknown) => {
					assert.equal(errorCode(error), "conflict");
					return true;
				},
			);
			const updated = await store.update({ id: record.id }, input, live);
			assert.notEqual(updated.updatedAt, live);
		});
	});
});

test("a guard-skipped update is forbidden, not a conflict", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		await asRole(transaction, "studio", async () => {
			const store = createCampaignRepository(transaction);
			const record = await store.create({
				subject: "Review subject",
				body: "Review body",
			});
			await transaction
				.update(zelglihof.campaign)
				.set({ status: "queued" })
				.where(eq(zelglihof.campaign.id, record.id));

			// The token is current, so only the status guard can refuse.
			await assert.rejects(
				store.update(
					{ id: record.id },
					{ subject: "Updated", body: "Review body" },
					record.updatedAt,
				),
				(error: unknown) => {
					assert.equal(errorCode(error), "forbidden");
					return true;
				},
			);
			assert.equal((await store.get({ id: record.id }))?.status, "queued");
		});
	});
});
