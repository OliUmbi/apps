import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { count, eq, sql } from "drizzle-orm";
import {
	createDatabasePool,
	type Database,
	type DatabasePool,
	type Transaction,
} from "../packages/database/src";
import { createDonationCommitmentRepository } from "../packages/jublawoma-data/src/content/donation-commitment.repository";
import { message as queuedMessage } from "../packages/queue/src/schema";
import { createProductReservationRepository } from "../packages/zelglihof-data/src/content/product-reservation.repository";
import { createNewsletterRepository } from "../packages/zelglihof-data/src/newsletter.repository";
import { requestSubscription } from "../packages/zelglihof-data/src/newsletter.subscribe";
import {
	createSubscriberService,
	decideCorrection,
} from "../packages/zelglihof-data/src/subscriber.service";

const page = { page: 0, size: 30, search: "" };
const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};

test("address correction keeps unsubscribed subscribers out of the funnel", () => {
	assert.deepEqual(decideCorrection({ conflict: true, status: "active" }), {
		outcome: "conflict",
		restartConfirmation: false,
	});
	assert.deepEqual(decideCorrection({ conflict: false, status: "active" }), {
		outcome: "corrected",
		restartConfirmation: true,
	});
	assert.deepEqual(decideCorrection({ conflict: false, status: "pending" }), {
		outcome: "corrected",
		restartConfirmation: true,
	});
	assert.deepEqual(
		decideCorrection({ conflict: false, status: "unsubscribed" }),
		{ outcome: "corrected", restartConfirmation: false },
	);
});

const enabled = Boolean(process.env.STUDIO_TEST_ADMIN_URL);
test("database invariants against the migrated schema", {
	skip: !enabled,
}, async (context) => {
	const admin = createDatabasePool({
		role: "postgres",
		applicationName: "db-invariant-tests",
		connectionString: () => process.env.STUDIO_TEST_ADMIN_URL,
	});
	const rollback = new Error("Rollback invariant fixtures");

	// Every case runs in its own transaction and leaves no rows behind.
	async function rolledBack(work: (transaction: Transaction) => Promise<void>) {
		try {
			await admin.transaction(async (transaction) => {
				await work(transaction);
				throw rollback;
			});
		} catch (error) {
			if (error !== rollback) throw error;
		}
	}

	async function rejected(work: (transaction: Transaction) => Promise<void>) {
		await assert.rejects(admin.transaction(work));
	}

	// The flows open their own transaction; join the harness transaction so the
	// fixtures roll back with everything else.
	function joined(transaction: Transaction): DatabasePool {
		return {
			role: "postgres",
			db: transaction as unknown as Database,
			transaction: (work) => work(transaction),
			close: async () => {},
		};
	}

	async function seedSubscriber(
		transaction: Transaction,
		state: "pending" | "active" | "unsubscribed",
	) {
		const id = randomUUID();
		const email = `review-${randomUUID()}@example.com`;
		const unsubscribeToken = randomUUID();
		await transaction.execute(sql`
			INSERT INTO zelglihof.subscriber
				(id, email, status, requested_at, confirmation_token_hash, unsubscribe_token, created_at, updated_at)
			VALUES (${id}, ${email}, ${state}, now(), ${randomUUID()}, ${unsubscribeToken}, now(), now())`);
		return { id, email, unsubscribeToken };
	}

	async function queuedCount(transaction: Transaction, email: string) {
		const [row] = await transaction
			.select({ value: count() })
			.from(queuedMessage)
			.where(eq(queuedMessage.recipient, email));
		return row?.value ?? -1;
	}

	try {
		await context.test("status domains accept their states only", async () => {
			await rolledBack(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
					VALUES (${randomUUID()}, 'new', 'hofladen', 'Review', '+41 79 000 00 00', 'Review message', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO unclet.inquiry (id, status, name, email, phone, created_at, updated_at)
					VALUES (${randomUUID()}, 'completed', 'Review', 'review@example.com', '+41 79 000 00 00', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'cancelled', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.subscriber (id, email, status, requested_at, confirmation_token_hash, unsubscribe_token, created_at, updated_at)
					VALUES (${randomUUID()}, ${`review-${randomUUID()}@example.com`}, 'active', now(), ${randomUUID()}, ${randomUUID()}, now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.campaign (id, subject, body, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review subject', 'Review body', 'draft', now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
					VALUES (${randomUUID()}, 'archived', 'hofladen', 'Review', '+41 79 000 00 00', 'Review message', now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO unclet.inquiry (id, status, name, email, phone, created_at, updated_at)
					VALUES (${randomUUID()}, 'in progress', 'Review', 'review@example.com', '+41 79 000 00 00', now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'done', now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.subscriber (id, email, status, requested_at, confirmation_token_hash, unsubscribe_token, created_at, updated_at)
					VALUES (${randomUUID()}, ${`review-${randomUUID()}@example.com`}, 'confirmed', now(), ${randomUUID()}, ${randomUUID()}, now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.campaign (id, subject, body, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review subject', 'Review body', 'sent', now(), now())`);
			});
		});

		await context.test("review stars are a five-star scale", async () => {
			await rolledBack(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO unclet.review (id, stars, name, description, visible, created_at, updated_at)
					VALUES (${randomUUID()}, 3, 'Review', 'Review description', false, now(), now())`);
			});
			for (const stars of [0, 6, -1]) {
				await rejected(async (transaction) => {
					await transaction.execute(sql`
						INSERT INTO unclet.review (id, stars, name, description, visible, created_at, updated_at)
						VALUES (${randomUUID()}, ${stars}, 'Review', 'Review description', false, now(), now())`);
				});
			}
		});

		await context.test("quantities and steps are positive", async () => {
			await rolledBack(async (transaction) => {
				const donationId = randomUUID();
				await transaction.execute(sql`
					INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
					VALUES (${donationId}, 'Review title', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
					VALUES (${randomUUID()}, ${donationId}, 'Review name', 0.5, 0.1, 'kg', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO jublawoma.donation_commitment (id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review donation', 'Review item', 2.5, 0.5, 'kg', 'Review', '+41 79 000 00 00', 0.5, now(), now())`);
			});
			for (const values of ["0", "-1", "0.0"]) {
				await rejected(async (transaction) => {
					const donationId = randomUUID();
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
						VALUES (${donationId}, 'Review title', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`);
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
						VALUES (${randomUUID()}, ${donationId}, 'Review name', ${values}, 0.1, 'kg', now(), now())`);
				});
				await rejected(async (transaction) => {
					const donationId = randomUUID();
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
						VALUES (${donationId}, 'Review title', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`);
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
						VALUES (${randomUUID()}, ${donationId}, 'Review name', 2.5, ${values}, 'kg', now(), now())`);
				});
				await rejected(async (transaction) => {
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_commitment (id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
						VALUES (${randomUUID()}, 'Review donation', 'Review item', 2.5, 0.5, 'kg', 'Review', '+41 79 000 00 00', ${values}, now(), now())`);
				});
				await rejected(async (transaction) => {
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_commitment (id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
						VALUES (${randomUUID()}, 'Review donation', 'Review item', ${values}, 0.5, 'kg', 'Review', '+41 79 000 00 00', 0.5, now(), now())`);
				});
				await rejected(async (transaction) => {
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_commitment (id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
						VALUES (${randomUUID()}, 'Review donation', 'Review item', 2.5, ${values}, 'kg', 'Review', '+41 79 000 00 00', 0.5, now(), now())`);
				});
			}
		});

		await context.test("stock is never negative", async () => {
			await rolledBack(async (transaction) => {
				const productId = randomUUID();
				await transaction.execute(sql`
					INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, created_at, updated_at)
					VALUES (${productId}, 'Review', 'Review description', 'Review body', true, true, now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
					VALUES (${randomUUID()}, ${productId}, 'Review variant', 'CHF 5', NULL, now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
					VALUES (${randomUUID()}, ${productId}, 'Review variant', 'CHF 5', 0, now(), now())`);
			});
			await rejected(async (transaction) => {
				const productId = randomUUID();
				await transaction.execute(sql`
					INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, created_at, updated_at)
					VALUES (${productId}, 'Review', 'Review description', 'Review body', true, true, now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
					VALUES (${randomUUID()}, ${productId}, 'Review variant', 'CHF 5', -1, now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 0, 'new', now(), now())`);
			});
			await rolledBack(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_quantity, variant_price, name, phone, quantity, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review product', 'Review variant', 5, 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'new', now(), now())`);
			});
			await rejected(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_quantity, variant_price, name, phone, quantity, status, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review product', 'Review variant', -1, 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'new', now(), now())`);
			});
		});

		await context.test("date ranges run forward", async () => {
			await rolledBack(async (transaction) => {
				await transaction.execute(sql`
					INSERT INTO jublawoma.event (id, name, location, starts_on, ends_on, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review location', DATE '2026-09-17', DATE '2026-09-17', now(), now())`);
				await transaction.execute(sql`
					INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, starts_at, ends_at, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review description', 'Review body', true, true, now(), NULL, now(), now())`);
			});
			const backward: Array<[string, string]> = [
				[
					`INSERT INTO jublawoma.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review description', '/latest', now() + interval '1 day', now(), now(), now())`,
					"jublawoma.promotion",
				],
				[
					`INSERT INTO zelglihof.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review description', '/latest', now() + interval '1 day', now(), now(), now())`,
					"zelglihof.promotion",
				],
				[
					`INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review description', 'Review contact', now() + interval '1 day', now(), now(), now())`,
					"jublawoma.donation",
				],
				[
					`INSERT INTO jublawoma.event (id, name, location, starts_on, ends_on, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review location', DATE '2026-09-18', DATE '2026-09-17', now(), now())`,
					"jublawoma.event",
				],
				[
					`INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, starts_at, ends_at, created_at, updated_at)
					VALUES (${randomUUID()}, 'Review', 'Review description', 'Review body', true, true, now() + interval '1 day', now(), now(), now())`,
					"zelglihof.product",
				],
			];
			for (const [statement] of backward) {
				await rejected(async (transaction) => {
					await transaction.execute(sql.raw(statement));
				});
			}
		});

		await context.test(
			"inquiry subjects stay in their category set",
			async () => {
				await rolledBack(async (transaction) => {
					await transaction.execute(sql`
					INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
					VALUES (${randomUUID()}, 'new', 'other', 'Review', '+41 79 000 00 00', 'Review message', now(), now())`);
				});
				await rejected(async (transaction) => {
					await transaction.execute(sql`
					INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
					VALUES (${randomUUID()}, 'new', 'nonsense', 'Review', '+41 79 000 00 00', 'Review message', now(), now())`);
				});
			},
		);

		await context.test(
			"orphaned commitments and reservations stay visible",
			async () => {
				await rolledBack(async (transaction) => {
					const donationId = randomUUID();
					const itemId = randomUUID();
					const commitmentId = randomUUID();
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
						VALUES (${donationId}, 'Review donation', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`);
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
						VALUES (${itemId}, ${donationId}, 'Review item', 2.5, 0.5, 'kg', now(), now())`);
					await transaction.execute(sql`
						INSERT INTO jublawoma.donation_commitment (id, donation_id, donation_item_id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
						VALUES (${commitmentId}, ${donationId}, ${itemId}, 'Review donation', 'Review item', 2.5, 0.5, 'kg', 'Review', '+41 79 000 00 00', 0.5, now(), now())`);
					await transaction.execute(
						sql`DELETE FROM jublawoma.donation WHERE id = ${donationId}`,
					);
					const commitments = createDonationCommitmentRepository(transaction);
					const orphaned = await commitments.list(page);
					const record = orphaned.items.find((row) => row.id === commitmentId);
					assert.ok(record);
					assert.equal(record.donationId, null);
					assert.equal(record.donationItemId, null);
					assert.equal(record.donationTitle, "Review donation");
					assert.equal(record.itemName, "Review item");
					assert.equal(record.quantity, "0.5");
					assert.equal(
						(await commitments.listForDonation(page, donationId)).items.length,
						0,
					);
				});
				await rolledBack(async (transaction) => {
					const productId = randomUUID();
					const variantId = randomUUID();
					const reservationId = randomUUID();
					await transaction.execute(sql`
						INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, created_at, updated_at)
						VALUES (${productId}, 'Review product', 'Review description', 'Review body', true, true, now(), now())`);
					await transaction.execute(sql`
						INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
						VALUES (${variantId}, ${productId}, 'Review variant', 'CHF 5', 3, now(), now())`);
					await transaction.execute(sql`
						INSERT INTO zelglihof.product_reservation (id, product_id, product_variant_id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
						VALUES (${reservationId}, ${productId}, ${variantId}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'new', now(), now())`);
					await transaction.execute(
						sql`DELETE FROM zelglihof.product WHERE id = ${productId}`,
					);
					const reservations = createProductReservationRepository(transaction);
					const orphaned = await reservations.list(page);
					const record = orphaned.items.find((row) => row.id === reservationId);
					assert.ok(record);
					assert.equal(record.productId, null);
					assert.equal(record.productVariantId, null);
					assert.equal(record.productName, "Review product");
					assert.equal(record.variantName, "Review variant");
					assert.equal(
						(await reservations.listForProduct(page, productId)).items.length,
						0,
					);
				});
			},
		);

		await context.test(
			"re-subscribing keeps a working unsubscribe token",
			async () => {
				await rolledBack(async (transaction) => {
					const seeded = await seedSubscriber(transaction, "unsubscribed");
					await requestSubscription(joined(transaction), options, seeded.email);
					const repository = createNewsletterRepository(transaction);
					const record = await repository.byEmail(seeded.email);
					assert.equal(record?.status, "pending");
					assert.equal(record?.unsubscribeToken, seeded.unsubscribeToken);
					const resolved = await repository.byUnsubscribe(
						seeded.unsubscribeToken,
					);
					assert.equal(resolved?.id, record?.id);
				});
			},
		);

		await context.test(
			"address correction reports typed conflicts and keeps state",
			async () => {
				await rolledBack(async (transaction) => {
					const service = createSubscriberService(joined(transaction), options);
					const taken = await seedSubscriber(transaction, "pending");
					const owner = await seedSubscriber(transaction, "pending");
					const repository = createNewsletterRepository(transaction);

					// An address owned by another subscriber is a typed conflict.
					assert.deepEqual(await service.correctEmail(owner.id, taken.email), {
						outcome: "conflict",
					});
					assert.equal(
						(await repository.byEmail(owner.email))?.email,
						owner.email,
					);

					// An unsubscribed subscriber stays out: no status reset, no email.
					const unsubscribed = await seedSubscriber(
						transaction,
						"unsubscribed",
					);
					const replacement = `review-${randomUUID()}@example.com`;
					assert.deepEqual(
						await service.correctEmail(unsubscribed.id, replacement),
						{ outcome: "corrected" },
					);
					const corrected = await repository.byEmail(replacement);
					assert.equal(corrected?.status, "unsubscribed");
					assert.equal(
						corrected?.unsubscribeToken,
						unsubscribed.unsubscribeToken,
					);
					assert.equal(await queuedCount(transaction, replacement), 0);

					// A confirmed subscriber must confirm the new address again.
					const active = await seedSubscriber(transaction, "active");
					const activeReplacement = `review-${randomUUID()}@example.com`;
					assert.deepEqual(
						await service.correctEmail(active.id, activeReplacement),
						{ outcome: "corrected" },
					);
					const restarted = await repository.byEmail(activeReplacement);
					assert.equal(restarted?.status, "pending");
					assert.equal(await queuedCount(transaction, activeReplacement), 1);
				});
			},
		);
	} finally {
		await admin.close();
	}
});
