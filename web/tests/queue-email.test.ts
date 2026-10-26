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

test("two messages never share an id", () => {
	const first = emailMessage("s", "from", "to", "subject", "text");
	const second = emailMessage("s", "from", "to", "subject", "text");
	assert.notEqual(first.id, second.id);
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
			for (const name of ["insert", "values", "onConflictDoNothing"])
				api[name] = step(name);
			// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
			api.then = (resolve: (value: unknown) => unknown) =>
				Promise.resolve(undefined).then(resolve);
			return api;
		},
	} as unknown as Transaction;
	const message = emailMessage("s", "from", "to", "subject", "text");
	await createQueueClient(transaction).enqueue(message);
	assert.deepEqual(stored, [{ ...message, type: "email" }]);
});
