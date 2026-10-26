import assert from "node:assert/strict";
import test from "node:test";
import type { DatabaseExecutor } from "../packages/database/src";
import { createPublicRepository } from "../packages/zelglihof-data/src/public.repository";

/*
 * The public product read model returns availability already decided (state +
 * catalog key) from the window/stock join, so no caller re-derives the policy
 * from raw timestamps - and the join's window flag never leaks into the
 * payload. The policy itself is covered by zelglihof-availability.test.ts;
 * these cover the shaping onto the record. The window predicate
 * (`reservationWindowOpen`) is SQL and needs a live DB.
 */

const productId = "3b9b0d5a-9d2c-4f0e-8f6a-1a2b3c4d5e6f";

function fakeDatabase(selectAnswers: unknown[][]) {
	let selectRun = 0;
	const chain = (answer: () => unknown) => {
		const api: Record<string, unknown> = {};
		const step =
			() =>
			(..._input: unknown[]) =>
				api;
		for (const name of [
			"select",
			"from",
			"where",
			"orderBy",
			"limit",
			"innerJoin",
		])
			api[name] = step();
		// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
		api.then = (
			resolve: (value: unknown) => unknown,
			reject: (error: unknown) => unknown,
		) => Promise.resolve().then(answer).then(resolve, reject);
		return api;
	};
	const database = {
		select: () => chain(() => selectAnswers[selectRun++] ?? []),
	} as unknown as DatabaseExecutor;
	return database;
}

function productRow(overrides: Record<string, unknown> = {}) {
	return {
		id: productId,
		name: "Gemüsekiste",
		description: "Das Beste vom Hof",
		visible: true,
		reservable: true,
		windowOpen: true,
		createdAt: "2026-01-15T00:00:00.000Z",
		updatedAt: "2026-01-15T00:00:00.000Z",
		...overrides,
	};
}

const variants = [
	{
		id: "v1",
		productId,
		name: "Gross",
		price: "CHF 30",
		quantity: 3,
		createdAt: "2026-01-15T00:00:00.000Z",
		updatedAt: "2026-01-15T00:00:00.000Z",
	},
	{
		id: "v2",
		productId,
		name: "Klein",
		price: "CHF 20",
		quantity: 0,
		createdAt: "2026-01-15T00:00:00.000Z",
		updatedAt: "2026-01-15T00:00:00.000Z",
	},
	{
		id: "v3",
		productId,
		name: "Offen",
		price: "CHF 25",
		quantity: null,
		createdAt: "2026-01-15T00:00:00.000Z",
		updatedAt: "2026-01-15T00:00:00.000Z",
	},
];

test("the product payload carries its decided availability and no join seam", async () => {
	const repository = createPublicRepository(
		fakeDatabase([[productRow()], variants]),
	);
	const result = await repository.findProduct(productId);
	assert.ok(result);
	assert.equal(result.product.name, "Gemüsekiste");
	assert.deepEqual(result.product.availability, {
		state: "reservation-open",
		labelKey: "zelglihof_availability_reservation_open",
	});
	assert.equal("windowOpen" in result.product, false);
	assert.deepEqual(
		result.variants.map((variant) => variant.stock),
		[
			{
				state: "in-stock",
				remaining: 3,
				labelKey: "zelglihof_variant_stock_remaining",
			},
			{
				state: "sold-out",
				remaining: 0,
				labelKey: "zelglihof_availability_sold_out",
			},
			{ state: "untracked", remaining: null, labelKey: null },
		],
	);
});

test("a product the query does not surface reads as absent", async () => {
	const repository = createPublicRepository(fakeDatabase([[]]));
	assert.equal(await repository.findProduct(productId), null);
});

test("availability on the payload follows the stock join, not the row alone", async () => {
	const repository = createPublicRepository(
		fakeDatabase([[productRow()], [variants[1]]]),
	);
	const result = await repository.findProduct(productId);
	assert.ok(result);
	assert.deepEqual(result.product.availability, {
		state: "sold-out",
		labelKey: "zelglihof_availability_sold_out",
	});
});
