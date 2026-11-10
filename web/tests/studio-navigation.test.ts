import assert from "node:assert/strict";
import { test } from "node:test";
import { studioSearchSchema } from "../sites/studio/src/model/navigation";

test("studio search parses documented deep links", () => {
	const search = studioSearchSchema.parse({
		site: "zelglihof",
		area: "site",
		section: "zelglihof.product",
		mode: "create",
	});
	assert.deepEqual(search, {
		site: "zelglihof",
		area: "site",
		section: "zelglihof.product",
		mode: "create",
	});
});

test("a valid record id survives the deep-link round-trip", () => {
	const record = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";
	const search = studioSearchSchema.parse({
		site: "zelglihof",
		area: "site",
		section: "zelglihof.product",
		mode: "detail",
		record,
	});
	assert.equal(search.record, record);
	assert.equal(search.mode, "detail");
});

test("malformed record ids degrade to no selection instead of throwing", () => {
	const search = studioSearchSchema.parse({
		site: "zelglihof",
		area: "site",
		section: "zelglihof.product",
		mode: "detail",
		record: "not-a-uuid",
	});
	assert.equal(search.record, undefined);
	assert.equal(search.mode, "detail");
});

test("unknown search values fall back to the documented defaults", () => {
	const search = studioSearchSchema.parse({
		site: "nowhere",
		area: "nope",
		section: "mystery",
		mode: "sideways",
	});
	assert.deepEqual(search, {
		site: "zelglihof",
		area: "site",
		section: "overview",
		mode: "list",
	});
});
