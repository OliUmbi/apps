import assert from "node:assert/strict";
import test, { after } from "node:test";
import { count, eq } from "drizzle-orm";
import { AppError } from "../../packages/contracts/src";
import type { Transaction } from "../../packages/database/src";
import { referenceFor } from "../../packages/queue/src/email";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import { isConcurrentUpdateError } from "../../packages/zelglihof-data/src/content/errors";
import { createProductReservationRepository } from "../../packages/zelglihof-data/src/content/product-reservation.repository";
import type { ReservationInput } from "../../packages/zelglihof-data/src/forms";
import { createReservationService } from "../../packages/zelglihof-data/src/reservation.service";
import {
	productReservation,
	productVariant,
} from "../../packages/zelglihof-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	joinedDatabase,
	rolledBack,
} from "../support/database";
import {
	id,
	type ProductSeed,
	queuedEmails,
	seedProduct,
	uniqueEmail,
	variantQuantity,
} from "../support/fixtures";

/*
 * The reservation write path against real PostgreSQL: the variant row lock,
 * the availability predicate, the unique submission index, the stock decrement
 * and the cancellation transition are all SQL. Each case runs in a rolled-back
 * transaction, seeds its own product, and is filtered by a unique sender so
 * concurrently running suites cannot pollute the counts.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

const requests = () => uniqueEmail("requests");

type ProductSeedOptions = NonNullable<Parameters<typeof seedProduct>[1]>;

function reservationFor(
	seed: ProductSeed,
	overrides: Partial<ReservationInput> = {},
): ReservationInput {
	return {
		submissionId: id(),
		productId: seed.productId,
		variantId: seed.variantId,
		name: "Ana Muster",
		phone: "079 123 45 67",
		email: "",
		quantity: 1,
		note: "",
		...overrides,
	};
}

async function reservationCount(transaction: Transaction, productId: string) {
	const [row] = await transaction
		.select({ value: count() })
		.from(productReservation)
		.where(eq(productReservation.productId, productId));
	return Number(row?.value ?? 0);
}

/** Queue rows this reservation run produced (its sender is unique per run). */
async function queuedFrom(transaction: Transaction, sender: string) {
	const [row] = await transaction
		.select({ value: count() })
		.from(queuedMessage)
		.where(eq(queuedMessage.sender, sender));
	return Number(row?.value ?? 0);
}

async function messagesFor(transaction: Transaction, recipient: string) {
	return transaction
		.select({
			subject: queuedMessage.subject,
			text: queuedMessage.text,
		})
		.from(queuedMessage)
		.where(eq(queuedMessage.recipient, recipient));
}

async function seedReservation(
	transaction: Transaction,
	seed: ProductSeed,
	options: {
		status: "new" | "in-progress" | "completed";
		quantity?: number;
		variantQuantity?: number | null;
	},
) {
	const reservationId = id();
	const timestamp = new Date().toISOString();
	await transaction.insert(productReservation).values({
		id: reservationId,
		productId: seed.productId,
		productVariantId: seed.variantId,
		productName: "Review product",
		variantName: seed.variantName,
		variantQuantity:
			options.variantQuantity === undefined ? 5 : options.variantQuantity,
		variantPrice: "CHF 5",
		name: "Review customer",
		phone: "079 123 45 67",
		quantity: options.quantity ?? 2,
		status: options.status,
		createdAt: timestamp,
		updatedAt: timestamp,
	});
	// Read back through the column type so expectedUpdatedAt matches exactly.
	const [row] = await transaction
		.select()
		.from(productReservation)
		.where(eq(productReservation.id, reservationId));
	assert.ok(row);
	return { id: reservationId, updatedAt: row.updatedAt };
}

test("a reservation stores the row, decrements stock and queues both emails", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const sender = requests();
		const customer = uniqueEmail("customer");
		const seed = await seedProduct(transaction, { quantity: 5 });
		const submissionId = id();
		const result = await createReservationService(
			joinedDatabase(transaction),
			sender,
		).reserve(
			reservationFor(seed, { submissionId, quantity: 2, email: customer }),
		);

		assert.equal(result.outcome, "reserved");
		assert.equal(await variantQuantity(transaction, seed.variantId), 3);

		const [row] = await transaction
			.select()
			.from(productReservation)
			.where(eq(productReservation.submissionId, submissionId));
		assert.ok(row);
		assert.equal(row.status, "new");
		assert.equal(row.productName, "Review product");
		assert.equal(row.variantName, "Review variant");
		assert.equal(row.variantQuantity, 5);
		assert.equal(row.variantPrice, "CHF 5");
		assert.equal(row.quantity, 2);
		assert.equal(row.email, customer);
		assert.equal(row.note, null);

		assert.equal(await queuedFrom(transaction, sender), 2);
		assert.equal(await queuedEmails(transaction, sender), 1);
		assert.equal(await queuedEmails(transaction, customer), 1);

		const reference = referenceFor(submissionId);
		const [adminMail] = await messagesFor(transaction, sender);
		assert.equal(adminMail?.subject, "Neue Reservation");
		for (const value of [
			"Ana Muster",
			"079 123 45 67",
			customer,
			"Review product",
			"Review variant",
			"2",
			reference,
		])
			assert.ok(adminMail?.text.includes(value), `admin mail lacks ${value}`);

		const [customerMail] = await messagesFor(transaction, customer);
		assert.equal(customerMail?.subject, "Deine Reservation beim Zelglihof");
		assert.ok(customerMail?.text.includes(reference));
	});
});

test("the last unit can be reserved exactly once", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const sender = requests();
		const seed = await seedProduct(transaction, { quantity: 2 });
		const service = createReservationService(
			joinedDatabase(transaction),
			sender,
		);

		assert.equal(
			(await service.reserve(reservationFor(seed, { quantity: 2 }))).outcome,
			"reserved",
		);
		assert.equal(await variantQuantity(transaction, seed.variantId), 0);
		assert.equal(
			(await service.reserve(reservationFor(seed, { quantity: 1 }))).outcome,
			"unavailable",
		);
		assert.equal(await variantQuantity(transaction, seed.variantId), 0);
		assert.equal(await reservationCount(transaction, seed.productId), 1);
	});
});

test("refused reservations write, decrement and queue nothing", {
	skip,
}, async () => {
	assert.ok(admin);
	const tomorrow = new Date(Date.now() + 86_400_000);
	const yesterday = new Date(Date.now() - 86_400_000);
	const refusals: Array<{
		name: string;
		seed: ProductSeedOptions;
		unknownVariant?: boolean;
	}> = [
		{
			name: "hidden product",
			seed: { quantity: 5, visible: false },
		},
		{
			name: "non-reservable product",
			seed: { quantity: 5, reservable: false },
		},
		{
			name: "window not open yet",
			seed: { quantity: 5, startsAt: tomorrow },
		},
		{
			name: "window already ended",
			seed: { quantity: 5, endsAt: yesterday },
		},
		{
			name: "archived product",
			seed: { quantity: 5, archived: true },
		},
		{
			name: "sold out",
			seed: { quantity: 0 },
		},
		{
			name: "unknown variant",
			seed: { quantity: 5 },
			unknownVariant: true,
		},
	];

	for (const scenario of refusals) {
		await rolledBack(admin, async (transaction) => {
			const sender = requests();
			const seed = await seedProduct(transaction, scenario.seed);
			const result = await createReservationService(
				joinedDatabase(transaction),
				sender,
			).reserve(
				reservationFor(seed, {
					variantId: scenario.unknownVariant ? id() : seed.variantId,
				}),
			);

			assert.equal(result.outcome, "unavailable", scenario.name);
			assert.equal(
				await variantQuantity(transaction, seed.variantId),
				scenario.seed.quantity,
				scenario.name,
			);
			assert.equal(
				await reservationCount(transaction, seed.productId),
				0,
				scenario.name,
			);
			assert.equal(await queuedFrom(transaction, sender), 0, scenario.name);
		});
	}
});

test("an untracked variant reserves without a stock change", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const sender = requests();
		const seed = await seedProduct(transaction, { quantity: null });
		const result = await createReservationService(
			joinedDatabase(transaction),
			sender,
		).reserve(reservationFor(seed, { quantity: 2 }));

		assert.equal(result.outcome, "reserved");
		assert.equal(await variantQuantity(transaction, seed.variantId), null);
		assert.equal(await reservationCount(transaction, seed.productId), 1);
	});
});

test("a replayed submission writes and decrements once", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const sender = requests();
		const seed = await seedProduct(transaction, { quantity: 5 });
		const input = reservationFor(seed, { quantity: 2, email: uniqueEmail() });
		const service = createReservationService(
			joinedDatabase(transaction),
			sender,
		);

		const first = await service.reserve(input);
		const queued = await queuedFrom(transaction, sender);
		const replay = await service.reserve(input);

		assert.deepEqual(first, {
			outcome: "reserved",
			reference: referenceFor(input.submissionId),
		});
		assert.deepEqual(replay, first);
		assert.equal(await reservationCount(transaction, seed.productId), 1);
		assert.equal(await variantQuantity(transaction, seed.variantId), 3);
		assert.equal(await queuedFrom(transaction, sender), queued);
	});
});

test("the zelglihof role may reserve through the production grants", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const sender = requests();
		const seed = await seedProduct(transaction, { quantity: 5 });
		await asRole(transaction, "zelglihof", async () => {
			const result = await createReservationService(
				joinedDatabase(transaction),
				sender,
			).reserve(reservationFor(seed, { quantity: 2 }));
			assert.equal(result.outcome, "reserved");
		});
		assert.equal(await reservationCount(transaction, seed.productId), 1);
	});
});

test("cancelling a new reservation restores the stock exactly once", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedProduct(transaction, { quantity: 3 });
		const seeded = await seedReservation(transaction, seed, {
			status: "new",
			quantity: 2,
			variantQuantity: 5,
		});
		const reservations = createProductReservationRepository(transaction);

		const cancelled = await reservations.cancel(
			{ id: seeded.id },
			seeded.updatedAt,
			"review-actor",
			"Review reason",
		);

		assert.equal(cancelled.status, "cancelled");
		assert.equal(cancelled.stockRestored, true);
		assert.equal(cancelled.cancelledBy, "review-actor");
		assert.equal(cancelled.cancellationReason, "Review reason");
		assert.ok(cancelled.cancelledAt);
		assert.equal(await variantQuantity(transaction, seed.variantId), 5);

		await assert.rejects(
			reservations.cancel({ id: seeded.id }, cancelled.updatedAt, "x", null),
			(error) => error instanceof AppError && error.code === "forbidden",
		);
		assert.equal(await variantQuantity(transaction, seed.variantId), 5);
	});
});

test("only open reservations cancel and a stale token writes nothing", {
	skip,
}, async () => {
	assert.ok(admin);
	const cases = [
		{ status: "in-progress" as const, allowed: true },
		{ status: "completed" as const, allowed: false },
	];
	for (const scenario of cases) {
		await rolledBack(admin, async (transaction) => {
			const seed = await seedProduct(transaction, { quantity: 3 });
			const seeded = await seedReservation(transaction, seed, {
				status: scenario.status,
				quantity: 2,
			});
			const reservations = createProductReservationRepository(transaction);

			if (scenario.allowed) {
				const cancelled = await reservations.cancel(
					{ id: seeded.id },
					seeded.updatedAt,
					"review-actor",
					null,
				);
				assert.equal(cancelled.status, "cancelled");
				assert.equal(await variantQuantity(transaction, seed.variantId), 5);
			} else {
				await assert.rejects(
					reservations.cancel(
						{ id: seeded.id },
						seeded.updatedAt,
						"review-actor",
						null,
					),
					(error) => error instanceof AppError && error.code === "forbidden",
				);
				assert.equal(await variantQuantity(transaction, seed.variantId), 3);
			}

			// A stale updatedAt is a typed conflict and leaves the row untouched.
			const [row] = await transaction
				.select()
				.from(productReservation)
				.where(eq(productReservation.id, seeded.id));
			assert.ok(row);
			await assert.rejects(
				reservations.cancel(
					{ id: seeded.id },
					"2020-01-01T00:00:00.000Z",
					"review-actor",
					null,
				),
				(error) => isConcurrentUpdateError(error),
			);
			const [unchanged] = await transaction
				.select()
				.from(productReservation)
				.where(eq(productReservation.id, seeded.id));
			assert.equal(unchanged?.status, row.status);
			assert.equal(unchanged?.updatedAt, row.updatedAt);
		});
	}
});

test("a reservation without a live tracked variant cancels without stock", {
	skip,
}, async () => {
	assert.ok(admin);
	// Snapshot says untracked; the variant still exists with NULL stock.
	await rolledBack(admin, async (transaction) => {
		const seed = await seedProduct(transaction, { quantity: null });
		const seeded = await seedReservation(transaction, seed, {
			status: "new",
			variantQuantity: null,
		});
		const cancelled = await createProductReservationRepository(
			transaction,
		).cancel({ id: seeded.id }, seeded.updatedAt, "review-actor", null);
		assert.equal(cancelled.status, "cancelled");
		assert.equal(cancelled.stockRestored, false);
		assert.equal(await variantQuantity(transaction, seed.variantId), null);
	});

	// The variant was deleted after the reservation; product_variant_id is null.
	await rolledBack(admin, async (transaction) => {
		const seed = await seedProduct(transaction, { quantity: 3 });
		const seeded = await seedReservation(transaction, seed, {
			status: "new",
			variantQuantity: 5,
		});
		await transaction
			.delete(productVariant)
			.where(eq(productVariant.id, seed.variantId));
		const cancelled = await createProductReservationRepository(
			transaction,
		).cancel({ id: seeded.id }, seeded.updatedAt, "review-actor", null);
		assert.equal(cancelled.status, "cancelled");
		assert.equal(cancelled.stockRestored, false);
		assert.equal(cancelled.productVariantId, null);
	});
});
