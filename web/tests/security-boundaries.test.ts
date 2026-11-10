import assert from "node:assert/strict";
import test from "node:test";
import { safeLinkHref } from "../packages/contracts/src/links";
import { passwordSchema } from "../packages/identity/src/password";
import { parseSimpleMarkdown } from "../packages/ui/src/parse-simple-markdown";

/*
 * Security helpers at the render boundary: link hrefs, the markdown renderer
 * that consumes them, and the password policy. Each test pins the rejection
 * behaviour, not just the happy path - a helper that accepts everything must
 * fail here.
 */

test("safeLinkHref rejects control characters and backslashes inside links", () => {
	for (const href of [
		"/\t/evil.com",
		"/\n/evil.com",
		"\u0000",
		"/\\evil.com",
	]) {
		assert.equal(safeLinkHref(href), undefined, JSON.stringify(href));
	}
	for (const href of [
		"#fragment",
		"/contact",
		"https://example.com/a",
		"mailto:ana@example.com",
	]) {
		assert.equal(safeLinkHref(href), href);
	}
	assert.equal(
		safeLinkHref("data:text/html,<script>alert(1)</script>"),
		undefined,
	);
	assert.equal(safeLinkHref("ftp://example.com/file"), undefined);
});

test("markdown headings keep their levels 1-3", () => {
	const blocks = parseSimpleMarkdown("# Eins\n## Zwei\n### Drei");
	assert.deepEqual(
		blocks.map((block) =>
			block.type === "heading"
				? `${block.level}:${block.content[0].type === "text" ? block.content[0].value : ""}`
				: block.type,
		),
		["1:Eins", "2:Zwei", "3:Drei"],
	);
});

test("consecutive list items group, ordered and unordered separately", () => {
	const blocks = parseSimpleMarkdown("- a\n- b\n\n1. c\n2. d");
	assert.equal(blocks.length, 2);
	assert.deepEqual(
		blocks.map((block) =>
			block.type === "list"
				? [block.ordered, block.items.length]
				: [block.type],
		),
		[
			[false, 2],
			[true, 2],
		],
	);
});

test("a blockquote and a rule become their own blocks", () => {
	const blocks = parseSimpleMarkdown("> zitiert\n\n---\n");
	assert.deepEqual(
		blocks.map((block) => block.type),
		["quote", "rule"],
	);
	const quote = blocks[0];
	assert.equal(
		quote.type === "quote" && quote.content[0].type === "text"
			? quote.content[0].value
			: undefined,
		"zitiert",
	);
});

test("a paragraph groups its lines and a blank line ends it", () => {
	const blocks = parseSimpleMarkdown("erste\nzweite\n\ndritte");
	assert.equal(blocks.length, 2);
	const [first, second] = blocks;
	assert.ok(first.type === "paragraph" && second.type === "paragraph");
	assert.equal(first.lines.length, 2);
	assert.equal(second.lines.length, 1);
	assert.equal(
		second.lines[0][0].type === "text" ? second.lines[0][0].value : undefined,
		"dritte",
	);
});

test("inline strong, emphasis and code are tokenized", () => {
	const [block] = parseSimpleMarkdown(
		"**fett** *kursiv* _auch_ `code` und Text",
	);
	assert.ok(block?.type === "paragraph");
	assert.deepEqual(
		block.lines[0].map((inline) => [
			inline.type,
			inline.type === "link" ? inline.label : inline.value,
		]),
		[
			["strong", "fett"],
			["text", " "],
			["emphasis", "kursiv"],
			["text", " "],
			["emphasis", "auch"],
			["text", " "],
			["code", "code"],
			["text", " und Text"],
		],
	);
});

test("a javascript: link is never emitted as a link", () => {
	const [block] = parseSimpleMarkdown("[klick](javascript:alert(1))");
	assert.ok(block?.type === "paragraph");
	assert.equal(
		block.lines[0].some((inline) => inline.type === "link"),
		false,
	);
	assert.equal(
		block.lines[0]
			.map((inline) => (inline.type === "link" ? inline.href : inline.value))
			.join(""),
		"[klick](javascript:alert(1))",
	);
});

test("passwordSchema counts UTF-8 bytes, not characters", () => {
	const bytes = (value: string) => new TextEncoder().encode(value).length;
	// 38 characters, but the multi-byte Ä's take the payload to the byte limit.
	const exact = `Aa1${"Ä".repeat(34)}b`;
	const over = `${exact}c`;
	assert.equal(bytes(exact), 72);
	assert.equal(bytes(over), 73);
	assert.equal(passwordSchema.safeParse(exact).success, true);
	assert.equal(passwordSchema.safeParse(over).success, false);
});

test("passwordSchema requires ten characters and every character class", () => {
	assert.equal(passwordSchema.safeParse("Abcdefgh12").success, true);
	assert.equal(passwordSchema.safeParse("Abcdefg12").success, false);
	for (const missing of ["abcdefghij1", "ABCDEFGHIJ1", "Abcdefghij"]) {
		assert.equal(
			passwordSchema.safeParse(missing).success,
			false,
			`${missing} lacks a required class`,
		);
	}
});
