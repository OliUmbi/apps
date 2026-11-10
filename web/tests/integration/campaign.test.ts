import assert from "node:assert/strict";
import test, { after } from "node:test";
import { count, eq, inArray } from "drizzle-orm";
import type { DatabasePool, Transaction } from "../../packages/database/src";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import { createCampaignService } from "../../packages/zelglihof-data/src/campaign.service";
import { campaignRecipientLimit } from "../../packages/zelglihof-data/src/campaign.types";
import { campaign, subscriber } from "../../packages/zelglihof-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	joinedDatabase,
	rolledBack,
} from "../support/database";
import {
	id,
	queuedEmails,
	seedCampaign,
	seedSubscriber,
	uniqueEmail,
} from "../support/fixtures";

/*
 * Campaign dispatch against real PostgreSQL: the `gt(id, afterId)` batch cursor,
 * the active-only audience filter, the recipient bound and the draft guard are
 * SQL. The committed database may already hold active subscribers, so every
 * bound here is expressed relative to the baseline the run counts.
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

async function activeCount(transaction: Transaction) {
	const [row] = await transaction
		.select({ value: count() })
		.from(subscriber)
		.where(eq(subscriber.status, "active"));
	return Number(row?.value ?? 0);
}

async function queuedTo(database: DatabasePool, recipient: string) {
	return database.transaction(async (transaction) => {
		const [row] = await transaction
			.select({ value: count() })
			.from(queuedMessage)
			.where(eq(queuedMessage.recipient, recipient));
		return Number(row?.value ?? 0);
	});
}

async function campaignRow(transaction: Transaction, campaignId: string) {
	const [row] = await transaction
		.select()
		.from(campaign)
		.where(eq(campaign.id, campaignId));
	return row;
}

async function seedActive(
	transaction: Transaction,
	size: number,
): Promise<string[]> {
	const emails: string[] = [];
	for (let index = 0; index < size; index += 1) {
		const seed = await seedSubscriber(transaction, { status: "active" });
		emails.push(seed.email);
	}
	return emails;
}

test("dispatch pages the whole audience exactly once across batches", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		// More than the batch size (100), so the real cursor runs more than once.
		const emails = await seedActive(transaction, 205);
		const { campaignId } = await seedCampaign(transaction);
		const saved = await campaignRow(transaction, campaignId);
		assert.ok(saved);

		const result = await createCampaignService(
			joinedDatabase(transaction),
			options,
		).send(campaignId, saved.updatedAt);
		if (result.outcome !== "queued")
			assert.fail(`expected queued, got ${result.outcome}`);

		assert.equal(result.count, await activeCount(transaction));
		const perRecipient = await transaction
			.select({ email: queuedMessage.recipient, value: count() })
			.from(queuedMessage)
			.where(inArray(queuedMessage.recipient, emails))
			.groupBy(queuedMessage.recipient);
		assert.equal(perRecipient.length, emails.length);
		for (const row of perRecipient)
			assert.equal(Number(row.value), 1, row.email);

		const [recipient] = emails;
		assert.ok(recipient);
		const [subscriberRow] = await transaction
			.select({ token: subscriber.unsubscribeToken })
			.from(subscriber)
			.where(eq(subscriber.email, recipient));
		const [mail] = await transaction
			.select({
				subject: queuedMessage.subject,
				text: queuedMessage.text,
				sender: queuedMessage.sender,
				replyTo: queuedMessage.replyTo,
			})
			.from(queuedMessage)
			.where(eq(queuedMessage.recipient, recipient));
		assert.equal(mail?.subject, "Review subject");
		assert.ok(mail?.text.startsWith("Review body"));
		assert.ok(
			mail?.text.includes(`/newsletter/unsubscribe/${subscriberRow?.token}`),
			"the campaign mail carries this recipient's unsubscribe link",
		);
		assert.equal(mail?.sender, options.sender);
		assert.equal(mail?.replyTo, options.replyTo);

		assert.equal(
			(await campaignRow(transaction, campaignId))?.status,
			"queued",
		);
	});
});

test("the exact recipient limit still sends; one more is refused", {
	skip,
}, async (context) => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const baseline = await activeCount(transaction);
		if (baseline >= campaignRecipientLimit) {
			context.diagnostic(
				`baseline ${baseline} already reaches the limit ${campaignRecipientLimit}; boundary case skipped`,
			);
			return;
		}

		await seedActive(transaction, campaignRecipientLimit - baseline);
		assert.equal(await activeCount(transaction), campaignRecipientLimit);
		const { campaignId } = await seedCampaign(transaction);
		const saved = await campaignRow(transaction, campaignId);
		assert.ok(saved);

		const result = await createCampaignService(
			joinedDatabase(transaction),
			options,
		).send(campaignId, saved.updatedAt);
		// The bound refuses strictly more than the limit, so exactly `limit`
		// recipients is a valid send.
		if (result.outcome !== "queued")
			assert.fail(`expected queued, got ${result.outcome}`);
		assert.equal(result.count, campaignRecipientLimit);
		assert.equal(
			(await campaignRow(transaction, campaignId))?.status,
			"queued",
		);
	});
});

test("an audience over the limit is refused without queuing or state change", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const tracked = await seedSubscriber(transaction, { status: "active" });
		const baseline = await activeCount(transaction);
		const missing = campaignRecipientLimit + 1 - baseline;
		if (missing > 0) await seedActive(transaction, missing);
		const { campaignId } = await seedCampaign(transaction);
		const saved = await campaignRow(transaction, campaignId);
		assert.ok(saved);

		const result = await createCampaignService(
			joinedDatabase(transaction),
			options,
		).send(campaignId, saved.updatedAt);
		if (result.outcome !== "too-large")
			assert.fail(`expected too-large, got ${result.outcome}`);
		assert.equal(result.count, await activeCount(transaction));
		assert.equal(result.limit, campaignRecipientLimit);
		assert.equal(await queuedEmails(transaction, tracked.email), 0);
		assert.equal((await campaignRow(transaction, campaignId))?.status, "draft");
	});
});

test("pending and unsubscribed subscribers never receive a campaign", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const active = await seedSubscriber(transaction, { status: "active" });
		const pending = await seedSubscriber(transaction, { status: "pending" });
		const left = await seedSubscriber(transaction, { status: "unsubscribed" });
		const { campaignId } = await seedCampaign(transaction);
		const saved = await campaignRow(transaction, campaignId);
		assert.ok(saved);

		const result = await createCampaignService(
			joinedDatabase(transaction),
			options,
		).send(campaignId, saved.updatedAt);
		if (result.outcome !== "queued")
			assert.fail(`expected queued, got ${result.outcome}`);

		assert.equal(result.count, await activeCount(transaction));
		assert.equal(await queuedEmails(transaction, active.email), 1);
		assert.equal(await queuedEmails(transaction, pending.email), 0);
		assert.equal(await queuedEmails(transaction, left.email), 0);
	});
});

test("refused sends are typed and touch neither the queue nor the draft", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const service = createCampaignService(joinedDatabase(transaction), options);
		const tracked = await seedSubscriber(transaction, { status: "active" });

		// A queued (or sent) campaign is a state guard, not a retryable conflict.
		const sent = await seedCampaign(transaction, { status: "queued" });
		const sentRow = await campaignRow(transaction, sent.campaignId);
		assert.ok(sentRow);
		await assert.rejects(
			service.send(sent.campaignId, sentRow.updatedAt),
			(error: unknown) => (error as { code?: string }).code === "forbidden",
		);
		assert.equal(
			(await campaignRow(transaction, sent.campaignId))?.status,
			"queued",
		);
		assert.equal(await queuedEmails(transaction, tracked.email), 0);

		// A stale editor token names a version nobody confirmed: nothing queued.
		const draft = await seedCampaign(transaction);
		assert.deepEqual(
			await service.send(
				draft.campaignId,
				new Date(Date.now() - 60_000).toISOString(),
			),
			{ outcome: "stale-draft" },
		);
		assert.equal(
			(await campaignRow(transaction, draft.campaignId))?.status,
			"draft",
		);
		assert.equal(await queuedEmails(transaction, tracked.email), 0);

		await assert.rejects(
			service.send(id(), new Date().toISOString()),
			(error: unknown) => (error as { code?: string }).code === "not-found",
		);
	});
});

test("the zelglihof role may send through the production grants", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const tracked = await seedSubscriber(transaction, {
			status: "active",
			email: uniqueEmail("grant"),
		});
		const { campaignId } = await seedCampaign(transaction);
		const saved = await campaignRow(transaction, campaignId);
		assert.ok(saved);

		await asRole(transaction, "zelglihof", async () => {
			const result = await createCampaignService(
				joinedDatabase(transaction),
				options,
			).send(campaignId, saved.updatedAt);
			if (result.outcome !== "queued")
				assert.fail(`expected queued, got ${result.outcome}`);
		});
		assert.equal(await queuedEmails(transaction, tracked.email), 1);
	});
});

test("concurrent sends of one draft queue it once", {
	skip,
	timeout: 20_000,
}, async () => {
	const seeding = adminDatabase();
	const left = adminDatabase();
	const right = adminDatabase();
	const emails: string[] = [];
	let campaignId: string | undefined;
	try {
		const seeded = await seeding.transaction(async (transaction) => {
			for (let index = 0; index < 3; index += 1) {
				const seed = await seedSubscriber(transaction, { status: "active" });
				emails.push(seed.email);
			}
			return seedCampaign(transaction);
		});
		campaignId = seeded.campaignId;
		const [saved] = await seeding.transaction((transaction) =>
			transaction
				.select({ updatedAt: campaign.updatedAt })
				.from(campaign)
				.where(eq(campaign.id, seeded.campaignId)),
		);
		assert.ok(saved);

		const settled = await Promise.allSettled([
			createCampaignService(left, options).send(
				seeded.campaignId,
				saved.updatedAt,
			),
			createCampaignService(right, options).send(
				seeded.campaignId,
				saved.updatedAt,
			),
		]);

		// The campaign row lock serializes the pair: the loser reads the queued
		// status and is refused before it can queue a second copy.
		const fulfilled = settled.filter((entry) => entry.status === "fulfilled");
		const rejected = settled.filter((entry) => entry.status === "rejected");
		assert.equal(fulfilled.length, 1);
		assert.equal(rejected.length, 1);
		assert.equal(
			(fulfilled[0] as PromiseFulfilledResult<{ outcome: string }>).value
				.outcome,
			"queued",
		);
		assert.equal(
			(rejected[0] as PromiseRejectedResult).reason.code,
			"forbidden",
		);
		for (const email of emails)
			assert.equal(await queuedTo(seeding, email), 1, email);
	} finally {
		try {
			await seeding.transaction(async (transaction) => {
				await transaction
					.delete(queuedMessage)
					.where(inArray(queuedMessage.recipient, emails));
				if (campaignId)
					await transaction.delete(campaign).where(eq(campaign.id, campaignId));
				await transaction
					.delete(subscriber)
					.where(inArray(subscriber.email, emails));
			});
		} finally {
			await Promise.all([seeding.close(), left.close(), right.close()]);
		}
	}
});
