import assert from "node:assert/strict";
import test from "node:test";
import {
	addDecimals,
	compareDecimals,
	decideCommitment,
	validIncrement,
} from "../packages/jublawoma-data/src/donation.service";
import { decimalSchema } from "../packages/jublawoma-data/src/forms";

test("capacity check adds 0.1 + 0.2 exactly at the boundary", () => {
	assert.equal(addDecimals("0.1", "0.2"), "0.3");
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "0.3", step: "0.1" },
			quantity: "0.2",
			committed: "0.1",
		}),
		{ outcome: "committed", insert: true },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "0.3", step: "0.1" },
			quantity: "0.3",
			committed: "0.1",
		}),
		{ outcome: "oversold", insert: false },
	);
});

test("large quantities stay exact in increments and sums", () => {
	assert.equal(
		addDecimals("123456789012345678901234.5", "0.5"),
		"123456789012345678901235",
	);
	assert.equal(validIncrement("100000000000000000000.5", "0.5"), true);
	assert.equal(validIncrement("1000000000000000000000.3", "0.1"), true);
	assert.equal(validIncrement("9007199254740993", "1"), true);
});

test("increment check accepts exact step multiples only", () => {
	assert.equal(validIncrement("0.3", "0.1"), true);
	assert.equal(validIncrement("1.50", "0.5"), true);
	assert.equal(validIncrement("2", "0.5"), true);
	assert.equal(validIncrement("0.25", "0.1"), false);
	assert.equal(validIncrement("0.07", "0.1"), false);
	assert.equal(validIncrement("1", "0"), false);
});

test("decimal strings round-trip without formatting noise", () => {
	assert.equal(addDecimals("0.07", "0.01"), "0.08");
	assert.equal(addDecimals("0.10", "0.20"), "0.3");
	assert.equal(addDecimals("0", "0.5"), "0.5");
	assert.equal(compareDecimals("1.1", "1.10"), 0);
	assert.equal(compareDecimals("0.3", "0.29"), 1);
	assert.equal(compareDecimals("0.29", "0.3"), -1);
});

test("quantity validation accepts plain positive decimal strings", () => {
	assert.equal(decimalSchema.parse(" 0.5 "), "0.5");
	assert.equal(decimalSchema.parse("12"), "12");
	for (const value of ["1e3", "0", "0.000", "0.5.1", "-1", "kg", ""]) {
		assert.equal(decimalSchema.safeParse(value).success, false, value);
	}
});
