import assert from "node:assert/strict";
import test from "node:test";
import type { Transaction } from "../packages/database/src";
import { emailMessage } from "../packages/queue/src/email";
import { createQueueClient } from "../packages/queue/src/index";

/*
 * Enqueue payload shaping (referenceFor is covered by idempotency.test.ts):
 * every queued mail is a complete message - a unique id, the sending identity,
 * the text unchanged and an HTML part that escapes markup and renders line
 * breaks - and the queue client stores it on the caller's transaction under
 * the email envelope.
 */

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test("a message carries its identity and defaults reply-to to none", () => {
	const message = emailMessage(
		"zelglihof",
		"newsletter@zelglihof.ch",
		"ana@example.com",
		"Frühling",
		"Hallo",
	);
	assert.match(message.id, uuid);
	assert.equal(message.site, "zelglihof");
	assert.equal(message.sender, "newsletter@zelglihof.ch");
	assert.equal(message.recipient, "ana@example.com");
	assert.equal(message.subject, "Frühling");
	assert.equal(message.replyTo, null);
	assert.equal(
		emailMessage("s", "from", "to", "subject", "text", "hof@zelglihof.ch")
			.replyTo,
		"hof@zelglihof.ch",
	);
});

test("message ids are distinct version-4 UUIDs across a batch", () => {
	const ids = Array.from(
		{ length: 50 },
		() => emailMessage("s", "from", "to", "subject", "text").id,
	);
	assert.equal(new Set(ids).size, ids.length, "every queued id is unique");
	for (const id of ids)
		assert.match(
			id,
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
});

test("the text is kept verbatim and the HTML part escapes and breaks lines", () => {
	const text = "Tom & Jerry <3 \"big\" 'deal'\nsecond line";
	const message = emailMessage("s", "from", "to", "subject", text);
	assert.equal(message.text, text);
	assert.equal(
		message.html,
		"<p>Tom &amp; Jerry &lt;3 &quot;big&quot; &#039;deal&#039;<br>second line</p>",
	);
});

test("the queue client stores the message under the email envelope in the caller's transaction", async () => {
	const stored: unknown[] = [];
	const transaction = {
		insert: () => {
			const api: Record<string, unknown> = {};
			const step =
				(name: string) =>
				(...input: unknown[]) => {
					if (name === "values") stored.push(input[0]);
					return api;
				};
			for (const name of ["insert", "values"]) api[name] = step(name);
			// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
			api.then = (resolve: (value: unknown) => unknown) =>
				Promise.resolve(undefined).then(resolve);
			return api;
		},
	} as unknown as Transaction;
	const message = emailMessage(
		"zelglihof",
		"newsletter@zelglihof.ch",
		"ana@example.com",
		"Frühling",
		"Hallo",
	);
	await createQueueClient(transaction).enqueue(message);
	assert.equal(stored.length, 1);
	const envelope = stored[0] as Record<string, unknown>;
	// The explicit envelope contract, independent of how emailMessage is built.
	assert.equal(envelope.type, "email");
	assert.match(String(envelope.id), uuid);
	assert.equal(envelope.site, "zelglihof");
	assert.equal(envelope.sender, "newsletter@zelglihof.ch");
	assert.equal(envelope.recipient, "ana@example.com");
	assert.equal(envelope.subject, "Frühling");
	assert.equal(envelope.text, "Hallo");
	assert.equal(envelope.html, "<p>Hallo</p>");
	assert.equal(envelope.replyTo, null);
});
