import assert from "node:assert/strict";
import test from "node:test";
import {
	attemptSchema,
	messageSchema,
} from "../packages/messaging/src/schemas";

/*
 * The messaging service response is the contract. Zod strips unknown keys, so
 * adding a field on the Java side is invisible unless the fixture asserts the
 * exact key set and the nullable fields.
 */

const message = {
	id: "11111111-1111-4111-8111-111111111111",
	queueId: "22222222-2222-4222-8222-222222222222",
	site: "zelglihof",
	type: "email",
	sender: "newsletter@zelglihof-maegenwil.ch",
	recipient: "person@example.test",
	replyTo: null,
	subject: "Newsletter",
	status: "sent",
	attemptCount: 1,
	availableAt: null,
	lockedAt: null,
	requestedAt: "2026-11-13T08:00:00Z",
	finishedAt: "2026-11-13T08:00:01Z",
	createdAt: "2026-11-13T08:00:00Z",
	updatedAt: "2026-11-13T08:00:01Z",
};

test("the message schema mirrors the service response", () => {
	const parsed = messageSchema.parse(message);
	assert.deepEqual(Object.keys(parsed).sort(), Object.keys(message).sort());
	assert.equal(parsed.sender, "newsletter@zelglihof-maegenwil.ch");
	assert.equal(parsed.lockedAt, null);
});

test("the message schema requires the sender and a valid id", () => {
	const { sender: _sender, ...withoutSender } = message;
	assert.equal(messageSchema.safeParse(withoutSender).success, false);
	assert.equal(
		messageSchema.safeParse({ ...message, id: "not-a-uuid" }).success,
		false,
	);
});

const attempt = {
	attemptNumber: 1,
	outcome: "retry",
	detail: { code: "SMTP_TIMEOUT", message: "The delivery timed out." },
	startedAt: "2026-11-13T08:00:00Z",
	finishedAt: "2026-11-13T08:00:01Z",
	createdAt: "2026-11-13T08:00:00Z",
	updatedAt: "2026-11-13T08:00:01Z",
};

test("the attempt schema mirrors the service response", () => {
	const parsed = attemptSchema.parse(attempt);
	assert.deepEqual(Object.keys(parsed).sort(), Object.keys(attempt).sort());
	assert.equal(parsed.detail?.code, "SMTP_TIMEOUT");
	assert.equal(parsed.finishedAt, "2026-11-13T08:00:01Z");
});

test("the attempt schema rejects a non-positive or fractional attempt number", () => {
	assert.equal(
		attemptSchema.safeParse({ ...attempt, attemptNumber: 0 }).success,
		false,
	);
	assert.equal(
		attemptSchema.safeParse({ ...attempt, attemptNumber: 1.5 }).success,
		false,
	);
	assert.equal(
		attemptSchema.safeParse({ ...attempt, detail: null }).success,
		true,
	);
});
