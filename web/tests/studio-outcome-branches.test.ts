import assert from "node:assert/strict";
import test from "node:test";
import {
	campaignSendFeedback,
	correctionFeedback,
} from "../sites/studio/src/server/outcomes";

/*
 * Studio outcome branches: a resolved server result is not automatically a
 * success. The typed outcome decides what the form shows, so a refusal can
 * never render as one.
 */

test("an address correction conflict is a refusal, never a success", () => {
	// "conflict" (address already subscribed) shows the refusal message.
	assert.equal(
		correctionFeedback({ failed: false, result: { outcome: "conflict" } }),
		"conflict",
	);
	assert.equal(
		correctionFeedback({ failed: false, result: { outcome: "corrected" } }),
		"corrected",
	);
	// A thrown failure outranks any resolved result; no result stays idle.
	assert.equal(
		correctionFeedback({ failed: true, result: { outcome: "corrected" } }),
		"failed",
	);
	assert.equal(correctionFeedback({ failed: true, result: null }), "failed");
	assert.equal(correctionFeedback({ failed: false, result: null }), "idle");
	assert.equal(
		correctionFeedback({ failed: false, result: undefined }),
		"idle",
	);
});

test("a stale-draft send keeps the dialog on its reload action", () => {
	assert.equal(
		campaignSendFeedback({
			failed: false,
			result: { outcome: "stale-draft" },
		}),
		"stale-draft",
	);
	assert.equal(
		campaignSendFeedback({ failed: false, result: { outcome: "queued" } }),
		"queued",
	);
	assert.equal(campaignSendFeedback({ failed: true, result: null }), "failed");
	assert.equal(campaignSendFeedback({ failed: false, result: null }), "idle");
});
