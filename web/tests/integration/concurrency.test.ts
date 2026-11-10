import assert from "node:assert/strict";
import test from "node:test";
import { count, eq, sql } from "drizzle-orm";
import type { DatabasePool } from "../../packages/database/src";
import { createDonationService } from "../../packages/jublawoma-data/src/donation.service";
import { donationCommitment } from "../../packages/jublawoma-data/src/schema";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import type { ReservationInput } from "../../packages/zelglihof-data/src/forms";
import { requestSubscription } from "../../packages/zelglihof-data/src/newsletter.subscribe";
import { createReservationService } from "../../packages/zelglihof-data/src/reservation.service";
import {
	productReservation,
	subscriber,
} from "../../packages/zelglihof-data/src/schema";
import { adminDatabase, databaseEnabled } from "../support/database";
import {
	id,
	type ProductSeed,
	seedDonation,
	seedProduct,
	uniqueEmail,
	variantQuantity,
} from "../support/fixtures";

/*
 * Concurrency is only real across independent connections that actually
 * commit, so these cases cannot run in the rolled-back harness. Each case seeds
 * with one admin pool, races two service calls on two separate pools, and
 * removes everything it created in a finally block. Submission ids and the
 * request/queue sender are unique per run, so repeats neither collide with each
 * other nor with concurrent test processes.
 */

const skip = !databaseEnabled;

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

async function reservationCount(database: DatabasePool, productId: string) {
	return database.transaction(async (transaction) => {
		const [row] = await transaction
			.select({ value: count() })
			.from(productReservation)
			.where(eq(productReservation.productId, productId));
		return Number(row?.value ?? 0);
	});
}

async function queuedCount(database: DatabasePool, sender: string) {
	return database.transaction(async (transaction) => {
		const [row] = await transaction
			.select({ value: count() })
			.from(queuedMessage)
			.where(eq(queuedMessage.sender, sender));
		return Number(row?.value ?? 0);
	});
}

async function queuedTo(database: DatabasePool, recipient: string) {
	return database.transaction(async (transaction) => {
		const [row] = await transaction
			.select({ value: count() })
			.from(queuedMessage)
			.where(eq(queuedMessage.recipient, recipient));
		return Number(row?.value ?? 0);
	});
}

/** Removes this run's queue rows, reservation rows, variants and product. */
async function remove(
	database: DatabasePool,
	productId: string,
	sender: string,
) {
	await database.transaction(async (transaction) => {
		await transaction.execute(
			sql`DELETE FROM zelglihof.product_reservation WHERE product_id = ${productId}`,
		);
		await transaction.execute(
			sql`DELETE FROM queue.message WHERE sender = ${sender}`,
		);
		await transaction.execute(
			sql`DELETE FROM zelglihof.product WHERE id = ${productId}`,
		);
	});
}

test("two reservations for the last unit cannot both win", {
	skip,
	timeout: 20_000,
}, async () => {
	const seeding = adminDatabase();
	const left = adminDatabase();
	const right = adminDatabase();
	try {
		// Repeat with fresh ids so a rare interleaving cannot hide behind one run.
		for (let round = 0; round < 3; round += 1) {
			const sender = uniqueEmail("requests");
			const seed = await seeding.transaction((transaction) =>
				seedProduct(transaction, { quantity: 1 }),
			);
			try {
				const results = await Promise.all([
					createReservationService(left, sender).reserve(reservationFor(seed)),
					createReservationService(right, sender).reserve(reservationFor(seed)),
				]);

				assert.deepEqual(
					results.map((result) => result.outcome).sort(),
					["reserved", "unavailable"],
					`round ${round}`,
				);
				assert.equal(
					await seeding.transaction((transaction) =>
						variantQuantity(transaction, seed.variantId),
					),
					0,
					`round ${round}`,
				);
				assert.equal(
					await reservationCount(seeding, seed.productId),
					1,
					`round ${round}`,
				);
				// Only the winner's request email is queued; no customer address.
				assert.equal(await queuedCount(seeding, sender), 1, `round ${round}`);
			} finally {
				await remove(seeding, seed.productId, sender);
			}
		}
	} finally {
		await Promise.all([seeding.close(), left.close(), right.close()]);
	}
});

test("concurrent replays of one submission land one row", {
	skip,
	timeout: 20_000,
}, async () => {
	const seeding = adminDatabase();
	const left = adminDatabase();
	const right = adminDatabase();
	const sender = uniqueEmail("requests");
	const seed = await seeding.transaction((transaction) =>
		seedProduct(transaction, { quantity: 5 }),
	);
	try {
		const input = reservationFor(seed, { quantity: 2 });
		const results = await Promise.all([
			createReservationService(left, sender).reserve(input),
			createReservationService(right, sender).reserve(input),
		]);

		assert.deepEqual(
			results.map((result) => result.outcome),
			["reserved", "reserved"],
		);
		assert.equal(
			await seeding.transaction((transaction) =>
				variantQuantity(transaction, seed.variantId),
			),
			3,
		);
		assert.equal(await reservationCount(seeding, seed.productId), 1);
		// A replay never queues a second pair of emails.
		assert.equal(await queuedCount(seeding, sender), 1);
	} finally {
		try {
			await remove(seeding, seed.productId, sender);
		} finally {
			await Promise.all([seeding.close(), left.close(), right.close()]);
		}
	}
});

function commitmentFor(seed: { donationId: string; itemId: string }) {
	return {
		submissionId: id(),
		donationId: seed.donationId,
		itemId: seed.itemId,
		name: "Ana Muster",
		phone: "079 123 45 67",
		quantity: "1",
		note: "",
	};
}

async function commitmentCount(
	database: DatabasePool,
	itemId: string,
): Promise<number> {
	return database.transaction(async (transaction) => {
		const [row] = await transaction
			.select({ value: count() })
			.from(donationCommitment)
			.where(eq(donationCommitment.donationItemId, itemId));
		return Number(row?.value ?? 0);
	});
}

async function removeDonation(database: DatabasePool, donationId: string) {
	await database.transaction(async (transaction) => {
		await transaction.execute(
			sql`DELETE FROM jublawoma.donation_commitment WHERE donation_id = ${donationId}`,
		);
		await transaction.execute(
			sql`DELETE FROM jublawoma.donation_item WHERE donation_id = ${donationId}`,
		);
		await transaction.execute(
			sql`DELETE FROM jublawoma.donation WHERE id = ${donationId}`,
		);
	});
}

test("two commitments for the last capacity cannot both win", {
	skip,
	timeout: 20_000,
}, async () => {
	const seeding = adminDatabase();
	const left = adminDatabase();
	const right = adminDatabase();
	try {
		for (let round = 0; round < 2; round += 1) {
			const seed = await seeding.transaction((transaction) =>
				seedDonation(transaction, { quantity: "1", step: "1" }),
			);
			try {
				const results = await Promise.all([
					createDonationService(left).commit(commitmentFor(seed)),
					createDonationService(right).commit(commitmentFor(seed)),
				]);

				assert.deepEqual(
					results.map((result) => result.outcome).sort(),
					["committed", "oversold"],
					`round ${round}`,
				);
				assert.equal(
					await commitmentCount(seeding, seed.itemId),
					1,
					`round ${round}`,
				);
			} finally {
				await removeDonation(seeding, seed.donationId);
			}
		}
	} finally {
		await Promise.all([seeding.close(), left.close(), right.close()]);
	}
});

const newsletterOptions = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};

test("concurrent signups for one address send one confirmation", {
	skip,
	timeout: 20_000,
}, async () => {
	const seeding = adminDatabase();
	const left = adminDatabase();
	const right = adminDatabase();
	const email = uniqueEmail("race-signup");
	try {
		const results = await Promise.all([
			requestSubscription(left, newsletterOptions, email),
			requestSubscription(right, newsletterOptions, email),
		]);

		// The advisory lock serializes the pair: the loser sees the fresh pending
		// row and is suppressed instead of queuing a second confirmation.
		assert.deepEqual(results.map((result) => result.outcome).sort(), [
			"confirmation-sent",
			"suppressed",
		]);
		assert.equal(await queuedTo(seeding, email), 1);
		const subscribers = await seeding.transaction(async (transaction) => {
			const [row] = await transaction
				.select({ value: count() })
				.from(subscriber)
				.where(eq(subscriber.email, email));
			return Number(row?.value ?? 0);
		});
		assert.equal(subscribers, 1);
	} finally {
		try {
			await seeding.transaction(async (transaction) => {
				await transaction
					.delete(queuedMessage)
					.where(eq(queuedMessage.recipient, email));
				await transaction.delete(subscriber).where(eq(subscriber.email, email));
			});
		} finally {
			await Promise.all([seeding.close(), left.close(), right.close()]);
		}
	}
});
