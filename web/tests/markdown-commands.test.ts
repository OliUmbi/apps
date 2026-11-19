import assert from "node:assert/strict";
import test from "node:test";
import {
	insertLink,
	prefixLines,
	wrapSelection,
} from "../sites/studio/src/components/content/markdown-commands";

test("wrapSelection wraps the selected text and keeps it selected", () => {
	const result = wrapSelection(
		{ value: "ein wort", start: 4, end: 8 },
		"*",
		"fett",
	);
	assert.deepEqual(result, {
		value: "ein *wort*",
		start: 5,
		end: 9,
	});
});

test("wrapSelection inserts a placeholder when the selection is empty", () => {
	const result = wrapSelection(
		{ value: "text", start: 4, end: 4 },
		"*",
		"fett",
	);
	assert.deepEqual(result, {
		value: "text*fett*",
		start: 5,
		end: 9,
	});
});

test("prefixLines adds and removes a block marker", () => {
	const added = prefixLines({ value: "eins\nzwei", start: 0, end: 9 }, "## ");
	assert.equal(added.value, "## eins\n## zwei");

	const removed = prefixLines(added, "## ");
	assert.equal(removed.value, "eins\nzwei");
});

test("prefixLines switches an existing block marker instead of stacking it", () => {
	const result = prefixLines({ value: "## Titel", start: 3, end: 3 }, "- ");
	assert.equal(result.value, "- Titel");
});

test("insertLink wraps selected text and selects the URL", () => {
	const result = insertLink({ value: "hier", start: 0, end: 4 });
	assert.equal(result.value, "[hier](https://)");
	assert.equal(result.value.slice(result.start, result.end), "https://");
});

test("insertLink inserts a label when nothing is selected", () => {
	const result = insertLink({ value: "", start: 0, end: 0 });
	assert.equal(result.value, "[Text](https://)");
	assert.equal(result.value.slice(result.start, result.end), "https://");
});
