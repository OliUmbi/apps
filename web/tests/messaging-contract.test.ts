import assert from "node:assert/strict";
import test from "node:test";
import { messageSchema } from "../packages/messaging/src/schemas";

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

test("the message schema requires the sender", () => {
	const { sender: _sender, ...withoutSender } = message;
	assert.equal(messageSchema.safeParse(withoutSender).success, false);
});
