import assert from "node:assert/strict";
import test from "node:test";
import {
	paginationClasses,
	paginationQueryKey,
} from "../packages/ui/src/pagination-state";

test("one loader generation keeps its pagination cache key", () => {
	const seed = { items: [1, 2], nextPage: 1 };
	const key = paginationQueryKey(["events"], seed);
	assert.match(String(key[1]), /^loader-generation-\d+$/);
	assert.deepEqual(paginationQueryKey(["events"], seed), key);
});

test("a new loader generation resets the chain instead of keeping stale pages", () => {
	const before = { items: [1, 2], nextPage: 1 };
	const after = { items: [1, 2], nextPage: 1 };
	assert.notEqual(
		paginationQueryKey(["events"], before)[1],
		paginationQueryKey(["events"], after)[1],
	);
});

test("cache keys keep the caller's query key prefix per list", () => {
	const seed = { items: [], nextPage: null };
	assert.equal(paginationQueryKey(["events"], seed)[0], "events");
	assert.notDeepEqual(
		paginationQueryKey(["events"], seed),
		paginationQueryKey(["stories"], seed),
	);
});

test("container classes carry no implicit class names", () => {
	assert.equal(paginationClasses("", "py-8"), "py-8");
	assert.equal(paginationClasses("", ""), "");
	assert.equal(
		paginationClasses("mx-auto max-w-[76rem]", "pb-12"),
		"mx-auto max-w-[76rem] pb-12",
	);
});
