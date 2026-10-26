import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { decideReservation } from "../packages/zelglihof-data/src/reservation.service";
import {
	type AvailabilityLabelKey,
	productAvailability,
	type VariantStockLabelKey,
	variantStock,
} from "../packages/zelglihof-data/src/reservation.types";

/*
 * The availability policy is one decision point for the public display and the
 * reservation write path. These tests pin its states, its label keys and its
 * agreement with the write path's verdicts.
 */

test("a counter product is never reservation open", () => {
	assert.deepEqual(
		productAvailability({ reservable: false, windowOpen: true, stock: [5] }),
		{ state: "farm-shop", labelKey: "zelglihof_availability_farm_shop" },
	);
	assert.deepEqual(
		productAvailability({ reservable: false, windowOpen: true, stock: [0] }),
		{ state: "farm-shop", labelKey: "zelglihof_availability_farm_shop" },
	);
});

test("a reservable product outside its window is off season", () => {
	assert.deepEqual(
		productAvailability({ reservable: true, windowOpen: false, stock: [5] }),
		{ state: "off-season", labelKey: "zelglihof_availability_off_season" },
	);
});

test("a product whose variants are all exhausted reads as sold out, not open", () => {
	assert.deepEqual(
		productAvailability({ reservable: true, windowOpen: true, stock: [0, 0] }),
		{ state: "sold-out", labelKey: "zelglihof_availability_sold_out" },
	);
	assert.deepEqual(
		productAvailability({ reservable: true, windowOpen: true, stock: [] }),
		{ state: "sold-out", labelKey: "zelglihof_availability_sold_out" },
	);
});

test("stock anywhere keeps the product reservation open", () => {
	assert.deepEqual(
		productAvailability({ reservable: true, windowOpen: true, stock: [0, 3] }),
		{
			state: "reservation-open",
			labelKey: "zelglihof_availability_reservation_open",
		},
	);
	// Untracked stock is unlimited stock; it never closes the reservation.
	assert.deepEqual(
		productAvailability({ reservable: true, windowOpen: true, stock: [null] }),
		{
			state: "reservation-open",
			labelKey: "zelglihof_availability_reservation_open",
		},
	);
});

test("variant stock states name their label key and remaining count", () => {
	assert.deepEqual(variantStock(null), {
		state: "untracked",
		remaining: null,
		labelKey: null,
	});
	assert.deepEqual(variantStock(0), {
		state: "sold-out",
		remaining: 0,
		labelKey: "zelglihof_availability_sold_out",
	});
	assert.deepEqual(variantStock(3), {
		state: "in-stock",
		remaining: 3,
		labelKey: "zelglihof_variant_stock_remaining",
	});
});

test("the write path refuses exactly what the display withholds", () => {
	// Sold-out display: any attempt is refused, whatever the window says.
	assert.deepEqual(
		decideReservation({
			replayed: false,
			available: true,
			stock: 0,
			quantity: 1,
		}),
		{ outcome: "unavailable", insert: false },
	);
	// Reservation open: the attempt is committed.
	assert.deepEqual(
		decideReservation({
			replayed: false,
			available: true,
			stock: 3,
			quantity: 2,
		}),
		{ outcome: "reserved", insert: true },
	);
	// Off season / counter product: the window predicate refuses the attempt.
	assert.deepEqual(
		decideReservation({
			replayed: false,
			available: false,
			stock: null,
			quantity: 1,
		}),
		{ outcome: "unavailable", insert: false },
	);
});

test("every availability label key exists in the message catalog", () => {
	const messagesPath = path.resolve(
		import.meta.dirname,
		"../packages/i18n/messages/de-CH.json",
	);
	const catalog = JSON.parse(fs.readFileSync(messagesPath, "utf8")) as Record<
		string,
		string
	>;
	const keys: (AvailabilityLabelKey | VariantStockLabelKey)[] = [
		"zelglihof_availability_reservation_open",
		"zelglihof_availability_sold_out",
		"zelglihof_availability_off_season",
		"zelglihof_availability_farm_shop",
		"zelglihof_variant_stock_remaining",
	];
	for (const key of keys) assert.ok(catalog[key], `missing catalog key ${key}`);
});
