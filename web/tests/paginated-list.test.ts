import assert from "node:assert/strict";
import test from "node:test";
import { paginationQueryKey } from "../packages/ui/src/pagination-state";

test("one loader generation keeps its pagination cache key", () => {
	const seed = { items: [1, 2], nextPage: 1 };
	const key = paginationQueryKey(["events"], seed);
	assert.deepEqual(key.slice(0, 1), ["events"]);
	assert.match(String(key[1]), /^loader-generation-\d+$/);
	assert.equal(key.length, 2);
	assert.deepEqual(paginationQueryKey(["events"], seed), key);
});

test("a new loader generation resets the chain instead of keeping stale pages", () => {
	const before = { items: [1, 2], nextPage: 1 };
	const after = { items: [1, 2], nextPage: 1 };
	const first = Number(
		String(paginationQueryKey(["events"], before)[1])
			.split("-")
			.at(-1),
	);
	const second = Number(
		String(paginationQueryKey(["events"], after)[1])
			.split("-")
			.at(-1),
	);
	assert.ok(second > first, "each unseen seed advances the generation");
});

test("cache keys keep the caller's query key prefix per list", () => {
	const seed = { items: [], nextPage: null };
	assert.equal(paginationQueryKey(["events"], seed)[0], "events");
	assert.notDeepEqual(
		paginationQueryKey(["events"], seed),
		paginationQueryKey(["stories"], seed),
	);
	// The same generation is reused for the same seed across both lists.
	assert.equal(
		paginationQueryKey(["events"], seed)[1],
		paginationQueryKey(["stories"], seed)[1],
	);
});
