import assert from "node:assert/strict";
import test from "node:test";
import type { DatabaseExecutor } from "../packages/database/src";
import { createProductRepository } from "../packages/zelglihof-data/src/content/product.repository";
import { decideReservationCancellation } from "../packages/zelglihof-data/src/content/product-reservation";
import { createProductReservationRepository } from "../packages/zelglihof-data/src/content/product-reservation.repository";
import {
	product,
	productReservation,
	productVariant,
} from "../packages/zelglihof-data/src/schema";

/*
 * TD-08 lifecycle: cancellation is a one-way transition with one stock
 * restoration, and archival retires a record without deleting its history.
 * These pin the pure rules and the repository's lock/write sequence; the SQL
 * predicates themselves need the PostgreSQL-gated suites.
 */

type Fields = Record<string, unknown>;
const savedAt = "2026-02-01T10:00:00.000Z";
const reservationId = "11111111-1111-4111-8111-111111111111";
const variantId = "22222222-2222-4222-8222-222222222222";

function fakeTransaction(options: {
	reservation?: Fields | null;
	variant?: Fields | null;
	updatedReservation?: Fields;
	archivedProduct?: Fields;
}) {
	const log = {
		variantSets: [] as Fields[],
		reservationSets: [] as Fields[],
		productSets: [] as Fields[],
	};
	let selectRun = 0;
	const chain = (answer: (calls: string[], args: unknown[][]) => unknown) => {
		const calls: string[] = [];
		const args: unknown[][] = [];
		const api: Record<string, unknown> = {};
		const step =
			(name: string) =>
			(...input: unknown[]) => {
				calls.push(name);
				args.push(input);
				return api;
			};
		for (const name of [
			"select",
			"insert",
			"update",
			"from",
			"where",
			"set",
			"values",
			"for",
			"returning",
			"limit",
			"orderBy",
		])
			api[name] = step(name);
		// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
		api.then = (
			resolve: (value: unknown) => unknown,
			reject: (error: unknown) => unknown,
		) =>
			Promise.resolve()
				.then(() => answer(calls, args))
				.then(resolve, reject);
		return api;
	};
	const transaction = {
		select: () =>
			chain(() => {
				const value = selectRun === 0 ? options.reservation : options.variant;
				selectRun += 1;
				return value ? [value] : [];
			}),
		update: (table: unknown) =>
			chain((calls, args) => {
				const at = calls.indexOf("set");
				const values = args[at]?.[0] as Fields;
				if (table === productVariant) {
					log.variantSets.push(values);
					return undefined;
				}
				if (table === product) {
					log.productSets.push(values);
					return [options.archivedProduct ?? values];
				}
				log.reservationSets.push(values);
				return [options.updatedReservation ?? values];
			}),
	};
	return { transaction: transaction as unknown as DatabaseExecutor, log };
}

test("cancellation is allowed only from new or in-progress", () => {
	assert.deepEqual(
		decideReservationCancellation({
			status: "new",
			variantQuantity: 3,
			variantExists: true,
			variantCurrentQuantity: 2,
		}),
		{ allowed: true, restoreStock: true },
	);
	assert.deepEqual(
		decideReservationCancellation({
			status: "in-progress",
			variantQuantity: 3,
			variantExists: true,
			variantCurrentQuantity: 0,
		}),
		{ allowed: true, restoreStock: true },
	);
	for (const status of ["completed", "cancelled"] as const)
		assert.deepEqual(
			decideReservationCancellation({
				status,
				variantQuantity: 3,
				variantExists: true,
				variantCurrentQuantity: 2,
			}),
			{ allowed: false },
		);
});

test("a missing or unlimited variant cancels without restoring stock", () => {
	// The reservation was created with tracked stock, but the variant is gone.
	assert.deepEqual(
		decideReservationCancellation({
			status: "new",
			variantQuantity: 3,
			variantExists: false,
			variantCurrentQuantity: null,
		}),
		{ allowed: true, restoreStock: false },
	);
	// The variant still exists but has unlimited stock now.
	assert.deepEqual(
		decideReservationCancellation({
			status: "new",
			variantQuantity: 3,
			variantExists: true,
			variantCurrentQuantity: null,
		}),
		{ allowed: true, restoreStock: false },
	);
	// A reservation created against unlimited stock never restores anything.
	assert.deepEqual(
		decideReservationCancellation({
			status: "new",
			variantQuantity: null,
			variantExists: true,
			variantCurrentQuantity: 7,
		}),
		{ allowed: true, restoreStock: false },
	);
});

test("cancelling a tracked reservation restores stock once and records who and when", async () => {
	const reservation = {
		id: reservationId,
		status: "new",
		updatedAt: savedAt,
		variantQuantity: 5,
		productVariantId: variantId,
		quantity: 2,
	};
	const cancelled = {
		...reservation,
		status: "cancelled",
		stockRestored: true,
	};
	const { transaction, log } = fakeTransaction({
		reservation,
		variant: { quantity: 3 },
		updatedReservation: cancelled,
	});
	const result = await createProductReservationRepository(transaction).cancel(
		{ id: reservationId },
		savedAt,
		"olive",
		"Customer called",
	);
	assert.equal(result.status, "cancelled");
	assert.equal(log.variantSets.length, 1);
	assert.ok(log.variantSets[0].quantity, "the variant stock is incremented");
	assert.equal(log.reservationSets.length, 1);
	const write = log.reservationSets[0];
	assert.equal(write.status, "cancelled");
	assert.equal(write.cancelledBy, "olive");
	assert.equal(write.cancellationReason, "Customer called");
	assert.equal(write.stockRestored, true);
	assert.equal(typeof write.cancelledAt, "string");
});

test("completed and already-cancelled reservations cannot be cancelled", async () => {
	for (const status of ["completed", "cancelled"] as const) {
		const { transaction, log } = fakeTransaction({
			reservation: {
				id: reservationId,
				status,
				updatedAt: savedAt,
				variantQuantity: 5,
				productVariantId: variantId,
				quantity: 2,
			},
			variant: { quantity: 3 },
		});
		await assert.rejects(
			createProductReservationRepository(transaction).cancel(
				{ id: reservationId },
				savedAt,
				"olive",
				null,
			),
			(error: unknown) => (error as { code?: string }).code === "forbidden",
		);
		assert.deepEqual(log.variantSets, []);
		assert.deepEqual(log.reservationSets, []);
	}
});

test("a stale cancellation token is a conflict and writes nothing", async () => {
	const { transaction, log } = fakeTransaction({
		reservation: {
			id: reservationId,
			status: "new",
			updatedAt: "2026-01-01T00:00:00.000Z",
			variantQuantity: 5,
			productVariantId: variantId,
			quantity: 2,
		},
		variant: { quantity: 3 },
	});
	await assert.rejects(
		createProductReservationRepository(transaction).cancel(
			{ id: reservationId },
			savedAt,
			"olive",
			null,
		),
		(error: unknown) => (error as { code?: string }).code === "conflict",
	);
	assert.deepEqual(log.variantSets, []);
	assert.deepEqual(log.reservationSets, []);
});

test("cancellation with a missing variant records that no stock was restored", async () => {
	const reservation = {
		id: reservationId,
		status: "in-progress",
		updatedAt: savedAt,
		variantQuantity: 5,
		productVariantId: variantId,
		quantity: 2,
	};
	const { transaction, log } = fakeTransaction({
		reservation,
		variant: null,
		updatedReservation: { ...reservation, status: "cancelled" },
	});
	await createProductReservationRepository(transaction).cancel(
		{ id: reservationId },
		savedAt,
		"olive",
		null,
	);
	assert.deepEqual(log.variantSets, []);
	assert.equal(log.reservationSets[0].stockRestored, false);
});

test("archiving an active product stamps the actor and keeps the row", async () => {
	const archived = {
		id: reservationId,
		name: "Review product",
		archivedAt: "2026-02-01T10:00:00.000Z",
		archivedBy: "olive",
	};
	const { transaction, log } = fakeTransaction({ archivedProduct: archived });
	const result = await createProductRepository(transaction).archive(
		{ id: reservationId },
		savedAt,
		"olive",
	);
	assert.equal(result, archived);
	assert.equal(log.productSets.length, 1);
	assert.equal(log.productSets[0].archivedBy, "olive");
	assert.equal(typeof log.productSets[0].archivedAt, "string");
});

test("archive and cancellation metadata stay distinct from the row identity", () => {
	// The schema's audit columns are additive: they never replace the parent
	// references or the snapshot columns reservation history depends on.
	assert.ok("archivedAt" in product);
	assert.ok("archivedBy" in product);
	assert.ok("archivedAt" in productVariant);
	assert.ok("archivedBy" in productVariant);
	assert.ok("cancelledAt" in productReservation);
	assert.ok("cancelledBy" in productReservation);
	assert.ok("stockRestored" in productReservation);
});
