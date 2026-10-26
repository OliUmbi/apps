import assert from "node:assert/strict";
import test from "node:test";
import { pageResult, pageSchema } from "../packages/contracts/src";
import { searchPattern } from "../packages/database/src/pagination";

/*
 * The pure query-layer contract every public and studio list runs on: the
 * page input's bounds and defaults, the one-extra-row page boundary, and the
 * LIKE pattern escaping that keeps a search for "100%" a literal search. The
 * SQL predicates around them (promotion windows, running events, published
 * flags) execute inside PostgreSQL and belong to the PG-gated suite.
 */

test("a page input defaults its page, size and search", () => {
	assert.deepEqual(pageSchema.parse({}), {
		page: 0,
		size: 30,
		search: "",
	});
	assert.deepEqual(pageSchema.parse({ page: 2, size: undefined }), {
		page: 2,
		size: 30,
		search: "",
	});
	assert.deepEqual(pageSchema.parse({ page: 0, size: 100, search: " brot " }), {
		page: 0,
		size: 100,
		search: "brot",
	});
});

test("page inputs outside their bounds are rejected", () => {
	for (const input of [
		{ page: -1 },
		{ page: 1.5 },
		{ size: 0 },
		{ size: 101 },
	]) {
		assert.equal(pageSchema.safeParse(input).success, false, String(input));
	}
	assert.equal(pageSchema.safeParse({ size: 1 }).success, true);
	assert.equal(pageSchema.safeParse({ size: 100 }).success, true);
});

test("a full page points at the next one, a short page ends the chain", () => {
	const rows = [1, 2, 3];
	// The query fetches one row past the page size; only that peek decides the
	// chain, so an exactly-full page never reports a phantom empty page.
	assert.deepEqual(pageResult([...rows, 4], { page: 0, size: 3, search: "" }), {
		items: [1, 2, 3],
		nextPage: 1,
	});
	assert.deepEqual(pageResult(rows, { page: 0, size: 3, search: "" }), {
		items: [1, 2, 3],
		nextPage: null,
	});
	assert.deepEqual(pageResult([], { page: 7, size: 3, search: "" }), {
		items: [],
		nextPage: null,
	});
	assert.deepEqual(pageResult([...rows, 4], { page: 7, size: 3, search: "" }), {
		items: [1, 2, 3],
		nextPage: 8,
	});
});

test("a search pattern keeps LIKE metacharacters literal", () => {
	assert.equal(searchPattern("brot"), "%brot%");
	assert.equal(searchPattern("100%"), "%100\\%%");
	assert.equal(searchPattern("a_b"), "%a\\_b%");
	assert.equal(searchPattern("back\\slash"), "%back\\\\slash%");
});
