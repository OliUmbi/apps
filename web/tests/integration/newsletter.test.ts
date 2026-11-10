import assert from "node:assert/strict";
import test, { after } from "node:test";
import { eq } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import { confirmSubscription } from "../../packages/zelglihof-data/src/newsletter.confirm";
import { requestSubscription } from "../../packages/zelglihof-data/src/newsletter.subscribe";
import {
	confirmationLifetimeMs,
	hashToken,
	newToken,
	resendDelayMs,
} from "../../packages/zelglihof-data/src/newsletter.tokens";
import { unsubscribeByToken } from "../../packages/zelglihof-data/src/newsletter.unsubscribe";
import { subscriber } from "../../packages/zelglihof-data/src/schema";
import { createSubscriberService } from "../../packages/zelglihof-data/src/subscriber.service";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	joinedDatabase,
	rolledBack,
} from "../support/database";
import { queuedEmails, seedSubscriber, uniqueEmail } from "../support/fixtures";

/*
 * The newsletter lifecycle against real PostgreSQL: the advisory lock, the
 * unique email index and every status transition are SQL, so only a live
 * database proves them. Each case runs in a rolled-back transaction; the
 * queued email table is read to recover the raw token the subscriber received.
 */

const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

const confirmationLink = /\/newsletter\/confirm\/([A-Za-z0-9_-]+)/;

async function subscriberRow(transaction: Transaction, email: string) {
	const [row] = await transaction
		.select()
		.from(subscriber)
		.where(eq(subscriber.email, email));
	return row;
}

async function queuedMessages(transaction: Transaction, email: string) {
	return transaction
		.select({ text: queuedMessage.text })
		.from(queuedMessage)
		.where(eq(queuedMessage.recipient, email));
}

/** Raw confirmation tokens recovered from the emails queued to `email`. */
async function confirmationTokens(transaction: Transaction, email: string) {
	const rows = await queuedMessages(transaction, email);
	return rows
		.map((row) => confirmationLink.exec(row.text)?.[1])
		.filter((token): token is string => Boolean(token));
}

/** A subscriber whose stored confirmation hash matches a token we know. */
async function withConfirmationToken(
	transaction: Transaction,
	options: {
		status: "pending" | "unsubscribed";
		email: string;
		requestedAt?: Date;
	},
) {
	const seed = await seedSubscriber(transaction, {
		status: options.status,
		email: options.email,
		requestedAt: options.requestedAt,
	});
	const token = newToken();
	await transaction
		.update(subscriber)
		.set({ confirmationTokenHash: hashToken(token) })
		.where(eq(subscriber.id, seed.subscriberId));
	return { ...seed, token };
}

test("a new signup stores a pending row and queues one confirmation with a hashed token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const email = uniqueEmail("signup");
		const result = await requestSubscription(
			joinedDatabase(transaction),
			options,
			email,
		);
		assert.deepEqual(result, { outcome: "confirmation-sent" });

		const row = await subscriberRow(transaction, email);
		assert.equal(row?.status, "pending");
		assert.equal(await queuedEmails(transaction, email), 1);

		const [token] = await confirmationTokens(transaction, email);
		assert.ok(token, "the confirmation email carries the raw token");
		assert.equal(row?.confirmationTokenHash, hashToken(token));
		// A leaked row cannot be replayed as a confirm link: only the hash is
		// stored, never the token from the delivered email.
		assert.notEqual(row?.confirmationTokenHash, token);
		assert.ok(!JSON.stringify(row).includes(token));
	});
});

test("resends follow the delay while re-subscribes keep the delivered unsubscribe token", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const database = joinedDatabase(transaction);

		// A fresh pending request inside the resend delay is suppressed.
		const fresh = await seedSubscriber(transaction, { status: "pending" });
		assert.deepEqual(
			await requestSubscription(database, options, fresh.email),
			{ outcome: "suppressed" },
		);
		assert.equal(await queuedEmails(transaction, fresh.email), 0);
		assert.equal(
			(await subscriberRow(transaction, fresh.email))?.confirmationTokenHash,
			fresh.confirmationTokenHash,
		);

		// Past the delay the same address gets a fresh token and confirmation.
		const late = await seedSubscriber(transaction, {
			status: "pending",
			requestedAt: new Date(Date.now() - resendDelayMs - 60_000),
		});
		assert.deepEqual(await requestSubscription(database, options, late.email), {
			outcome: "confirmation-sent",
		});
		assert.equal(await queuedEmails(transaction, late.email), 1);
		const lateRow = await subscriberRow(transaction, late.email);
		assert.notEqual(lateRow?.confirmationTokenHash, late.confirmationTokenHash);
		const [lateToken] = await confirmationTokens(transaction, late.email);
		assert.equal(lateRow?.confirmationTokenHash, hashToken(lateToken));

		// An active subscriber is never re-mailed.
		const active = await seedSubscriber(transaction, { status: "active" });
		assert.deepEqual(
			await requestSubscription(database, options, active.email),
			{ outcome: "suppressed" },
		);
		assert.equal(await queuedEmails(transaction, active.email), 0);

		// A re-subscribe sends a new confirmation but keeps the stored
		// unsubscribe token, so links in already-delivered emails still work.
		const left = await seedSubscriber(transaction, { status: "unsubscribed" });
		assert.deepEqual(await requestSubscription(database, options, left.email), {
			outcome: "confirmation-sent",
		});
		const returned = await subscriberRow(transaction, left.email);
		assert.equal(returned?.status, "pending");
		assert.equal(returned?.unsubscribeToken, left.unsubscribeToken);
		assert.equal(await queuedEmails(transaction, left.email), 1);
	});
});

test("confirming a valid token activates the subscriber and queues one welcome", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const email = uniqueEmail("confirm");
		const database = joinedDatabase(transaction);
		await requestSubscription(database, options, email);
		const [token] = await confirmationTokens(transaction, email);
		assert.ok(token);

		assert.deepEqual(await confirmSubscription(database, options, token), {
			outcome: "confirmed",
		});
		const active = await subscriberRow(transaction, email);
		assert.equal(active?.status, "active");
		assert.ok(active?.confirmedAt);
		assert.equal(await queuedEmails(transaction, email), 2);
		const welcome = (await queuedMessages(transaction, email)).find((row) =>
			row.text.includes(`/newsletter/unsubscribe/${active?.unsubscribeToken}`),
		);
		assert.ok(welcome, "the welcome carries the stored unsubscribe link");

		// Replaying the delivered link is a verdict, not a second welcome.
		assert.deepEqual(await confirmSubscription(database, options, token), {
			outcome: "already-confirmed",
		});
		assert.equal(await queuedEmails(transaction, email), 2);
		assert.equal((await subscriberRow(transaction, email))?.status, "active");
	});
});

test("refused confirmations are typed verdicts that write nothing", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const database = joinedDatabase(transaction);

		assert.deepEqual(await confirmSubscription(database, options, newToken()), {
			outcome: "invalid",
		});

		const expired = await withConfirmationToken(transaction, {
			status: "pending",
			email: uniqueEmail("expired"),
			requestedAt: new Date(Date.now() - confirmationLifetimeMs - 60_000),
		});
		assert.deepEqual(
			await confirmSubscription(database, options, expired.token),
			{ outcome: "expired" },
		);
		const expiredRow = await subscriberRow(transaction, expired.email);
		assert.equal(expiredRow?.status, "pending");
		assert.equal(expiredRow?.confirmationTokenHash, hashToken(expired.token));
		assert.equal(await queuedEmails(transaction, expired.email), 0);

		// A confirmation link for a subscriber who left never re-subscribes them.
		const left = await withConfirmationToken(transaction, {
			status: "unsubscribed",
			email: uniqueEmail("left"),
		});
		assert.deepEqual(await confirmSubscription(database, options, left.token), {
			outcome: "invalid",
		});
		assert.equal(
			(await subscriberRow(transaction, left.email))?.status,
			"unsubscribed",
		);
		assert.equal(await queuedEmails(transaction, left.email), 0);
	});
});

test("unsubscribing by token is idempotent and typed", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const active = await seedSubscriber(transaction, { status: "active" });
		assert.deepEqual(
			await unsubscribeByToken(
				joinedDatabase(transaction),
				active.unsubscribeToken,
			),
			{ outcome: "unsubscribed" },
		);
		const left = await subscriberRow(transaction, active.email);
		assert.equal(left?.status, "unsubscribed");
		assert.ok(left?.unsubscribedAt);
		assert.equal(await queuedEmails(transaction, active.email), 0);

		assert.deepEqual(
			await unsubscribeByToken(
				joinedDatabase(transaction),
				active.unsubscribeToken,
			),
			{ outcome: "already-unsubscribed" },
		);

		assert.deepEqual(
			await unsubscribeByToken(joinedDatabase(transaction), newToken()),
			{ outcome: "invalid" },
		);
	});
});

test("address corrections are typed and never silently re-subscribe", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const service = createSubscriberService(
			joinedDatabase(transaction),
			options,
		);

		// Correcting an unsubscribed subscriber onto its own address changes no
		// subscription state and queues nothing.
		const left = await seedSubscriber(transaction, { status: "unsubscribed" });
		assert.deepEqual(
			await service.correctEmail(left.subscriberId, left.email),
			{
				outcome: "corrected",
			},
		);
		const unchanged = await subscriberRow(transaction, left.email);
		assert.equal(unchanged?.status, "unsubscribed");
		assert.equal(unchanged?.unsubscribeToken, left.unsubscribeToken);
		assert.equal(unchanged?.confirmationTokenHash, left.confirmationTokenHash);
		assert.equal(await queuedEmails(transaction, left.email), 0);

		// Another subscriber's address is a typed conflict and writes nothing.
		const owner = await seedSubscriber(transaction, { status: "active" });
		const taken = await seedSubscriber(transaction, { status: "pending" });
		const ownerBefore = await subscriberRow(transaction, owner.email);
		assert.deepEqual(
			await service.correctEmail(owner.subscriberId, taken.email),
			{
				outcome: "conflict",
			},
		);
		const ownerAfter = await subscriberRow(transaction, owner.email);
		assert.equal(ownerAfter?.email, ownerBefore?.email);
		assert.equal(ownerAfter?.status, ownerBefore?.status);
		assert.equal(ownerAfter?.updatedAt, ownerBefore?.updatedAt);
		assert.equal(await queuedEmails(transaction, taken.email), 0);

		// An active subscriber correcting their address must confirm the new one.
		const active = await seedSubscriber(transaction, { status: "active" });
		const correctedEmail = uniqueEmail("corrected");
		assert.deepEqual(
			await service.correctEmail(active.subscriberId, correctedEmail),
			{
				outcome: "corrected",
			},
		);
		const restarted = await subscriberRow(transaction, correctedEmail);
		assert.equal(restarted?.status, "pending");
		assert.equal(restarted?.confirmedAt, null);
		assert.equal(await queuedEmails(transaction, correctedEmail), 1);
		const [correctionToken] = await confirmationTokens(
			transaction,
			correctedEmail,
		);
		assert.equal(restarted?.confirmationTokenHash, hashToken(correctionToken));

		// An unsubscribed subscriber stays out of the funnel on a new address.
		const out = await seedSubscriber(transaction, { status: "unsubscribed" });
		const newAddress = uniqueEmail("moved");
		assert.deepEqual(await service.correctEmail(out.subscriberId, newAddress), {
			outcome: "corrected",
		});
		const moved = await subscriberRow(transaction, newAddress);
		assert.equal(moved?.status, "unsubscribed");
		assert.equal(await queuedEmails(transaction, newAddress), 0);
	});
});

test("the zelglihof role may subscribe through the production grants", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const email = uniqueEmail("grant");
		await asRole(transaction, "zelglihof", async () => {
			const result = await requestSubscription(
				joinedDatabase(transaction),
				options,
				email,
			);
			assert.deepEqual(result, { outcome: "confirmation-sent" });
		});
		assert.equal((await subscriberRow(transaction, email))?.status, "pending");
		assert.equal(await queuedEmails(transaction, email), 1);
	});
});
