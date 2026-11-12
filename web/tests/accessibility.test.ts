import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const webRoot = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
	return fs.readFileSync(path.join(webRoot, ...parts), "utf8");
}

test("every public shell has a skip link and a main target", () => {
	const shells = [
		["unclet", "sites/unclet/src/routes/__root.tsx"],
		["jublawoma", "sites/jublawoma/src/routes/__root.tsx"],
		["zelglihof", "sites/zelglihof/src/routes/__root.tsx"],
		["oliumbi", "sites/oliumbi/src/routes/__root.tsx"],
		["studio", "sites/studio/src/components/app-shell.tsx"],
	] as const;
	for (const [name, file] of shells) {
		const content = source(file);
		assert.match(content, /href="#main"/, `${name} has no skip link`);
		assert.match(content, /id="main"/, `${name} has no main target`);
		assert.match(content, /tabIndex=\{-1\}/, `${name} main is not focusable`);
	}
});

test("the key focus and reduced-motion rules stay in place", () => {
	for (const file of [
		"sites/jublawoma/src/styles.css",
		"sites/studio/src/styles.css",
	]) {
		const content = source(file);
		assert.match(content, /focus-visible/, `${file} has no focus ring`);
		assert.match(
			content,
			/prefers-reduced-motion/,
			`${file} has no reduced-motion rule`,
		);
	}
});

test("a successful Zelglihof submission moves focus to the receipt", () => {
	const form = source("sites/zelglihof/src/components/submission-form.tsx");
	assert.match(form, /receipt\.current\?\.focus\(\)/);
	assert.match(form, /ref=\{receipt\}/);
});
