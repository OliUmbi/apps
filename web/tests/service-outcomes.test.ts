import assert from "node:assert/strict";
import test from "node:test";
import { decideCommitment } from "../packages/jublawoma-data/src/donation.service";
import type {
	CommitmentOutcome,
	CommitmentResult,
} from "../packages/jublawoma-data/src/donation.types";
import {
	decideSubscription,
	type SubscriptionOutcome,
} from "../packages/zelglihof-data/src/newsletter.subscribe";
import { resendDelayMs } from "../packages/zelglihof-data/src/newsletter.tokens";

/*
 * Outcome unions distinguish their causes. A surface that only needs a coarse
 * verdict folds them at its own boundary; the services never conflate them.
 */

// Compile-time completeness: every decision outcome has a result form, so a
// widened union cannot silently miss its result shape.
const commitmentOutcomes: Record<
	CommitmentOutcome,
	CommitmentResult["outcome"]
> = {
	committed: "committed",
	"not-found": "not-found",
	inactive: "inactive",
	oversold: "oversold",
	"invalid-increment": "invalid-increment",
};

test("a refused commitment names its cause", () => {
	assert.deepEqual(Object.keys(commitmentOutcomes).sort(), [
		"committed",
		"inactive",
		"invalid-increment",
		"not-found",
		"oversold",
	]);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: null,
			quantity: "1",
			committed: "0",
		}),
		{ outcome: "not-found", insert: false },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: undefined,
			quantity: "1",
			committed: "0",
		}),
		{ outcome: "not-found", insert: false },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: false, quantity: "10", step: "1" },
			quantity: "1",
			committed: "0",
		}),
		{ outcome: "inactive", insert: false },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "10", step: "1" },
			quantity: "11",
			committed: "0",
		}),
		{ outcome: "oversold", insert: false },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "10", step: "2" },
			quantity: "3",
			committed: "0",
		}),
		{ outcome: "invalid-increment", insert: false },
	);
	// The two positive verdicts stay unchanged.
	assert.deepEqual(
		decideCommitment({
			replayed: true,
			item: null,
			quantity: "1",
			committed: "0",
		}),
		{ outcome: "committed", insert: false },
	);
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "10", step: "1" },
			quantity: "1",
			committed: "0",
		}),
		{ outcome: "committed", insert: true },
	);
});

// The newsletter request either sends a confirmation or is suppressed; the two
// were one indistinguishable "accepted" before.
const subscriptionOutcomes: Record<SubscriptionOutcome, SubscriptionOutcome> = {
	"confirmation-sent": "confirmation-sent",
	suppressed: "suppressed",
};

test("a subscription request says whether a confirmation was sent", () => {
	assert.deepEqual(Object.keys(subscriptionOutcomes).sort(), [
		"confirmation-sent",
		"suppressed",
	]);
	const now = Date.parse("2026-03-01T12:00:00.000Z");
	// An active subscriber is never re-confirmed.
	assert.deepEqual(
		decideSubscription({
			status: "active",
			requestedAt: "2026-01-01T00:00:00.000Z",
			now,
		}),
		{ outcome: "suppressed", send: false },
	);
	// A pending address inside the resend delay is not re-mailed.
	assert.deepEqual(
		decideSubscription({
			status: "pending",
			requestedAt: new Date(now - resendDelayMs + 1).toISOString(),
			now,
		}),
		{ outcome: "suppressed", send: false },
	);
	// At the delay boundary a resend goes out again.
	assert.deepEqual(
		decideSubscription({
			status: "pending",
			requestedAt: new Date(now - resendDelayMs).toISOString(),
			now,
		}),
		{ outcome: "confirmation-sent", send: true },
	);
	// Re-subscribing after an unsubscribe sends a fresh confirmation.
	assert.deepEqual(
		decideSubscription({
			status: "unsubscribed",
			requestedAt: "2026-01-01T00:00:00.000Z",
			now,
		}),
		{ outcome: "confirmation-sent", send: true },
	);
	assert.deepEqual(
		decideSubscription({ status: null, requestedAt: null, now }),
		{ outcome: "confirmation-sent", send: true },
	);
});
