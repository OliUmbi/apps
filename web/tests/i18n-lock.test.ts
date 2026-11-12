import assert from "node:assert/strict";
import { test } from "node:test";
import { withGenerationLock } from "../packages/i18n/lock.mjs";

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
