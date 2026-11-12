import assert from "node:assert/strict";
import { mkdir, rm, stat, utimes } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { withGenerationLock } from "../packages/i18n/lock.mjs";

// Same path lock.mjs derives from its own module URL.
const lockDirectory = fileURLToPath(
	new URL(
		"../packages/i18n/project.inlang/cache/generation.lock",
		import.meta.url,
	),
);

test("concurrent generation writers serialize", async () => {
	let active = 0;
	let maximum = 0;
	let runs = 0;

	await Promise.all(
		[0, 1, 2].map(() =>
			withGenerationLock(async () => {
				active += 1;
				maximum = Math.max(maximum, active);
				await new Promise((resolve) => setTimeout(resolve, 20));
				runs += 1;
				active -= 1;
			}),
		),
	);

	assert.equal(runs, 3);
	assert.equal(maximum, 1);
});

test("an abandoned lock is taken over and cleaned up", async () => {
	await mkdir(lockDirectory, { recursive: true });
	const abandoned = new Date(Date.now() - 10 * 60_000);
	await utimes(lockDirectory, abandoned, abandoned);
	try {
		let ran = false;
		await withGenerationLock(async () => {
			ran = true;
		});
		assert.equal(ran, true);
		await assert.rejects(stat(lockDirectory));
	} finally {
		await rm(lockDirectory, { recursive: true, force: true });
	}
});
