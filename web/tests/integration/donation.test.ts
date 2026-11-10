import assert from "node:assert/strict";
import test, { after } from "node:test";
import { count, eq } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import { createDonationService } from "../../packages/jublawoma-data/src/donation.service";
import { donationCommitment } from "../../packages/jublawoma-data/src/schema";
import { referenceFor } from "../../packages/queue/src/email";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	joinedDatabase,
	rolledBack,
} from "../support/database";
import { id, seedDonation } from "../support/fixtures";

/*
 * The donation write path against real PostgreSQL: the row lock, the window
 * predicate, the committed-quantity aggregate and the unique submission index
 * are SQL, so only a live database proves them. Each case runs in a rolled-back
 * transaction and seeds its own donation.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

function commitmentFor(
	seed: { donationId: string; itemId: string },
	quantity: string,
	submissionId = id(),
) {
	return {
		submissionId,
		donationId: seed.donationId,
		itemId: seed.itemId,
		name: "Ana Muster",
		phone: "079 123 45 67",
		quantity,
		note: "",
	};
}

async function commitmentCount(transaction: Transaction, itemId: string) {
	const [row] = await transaction
		.select({ value: count() })
		.from(donationCommitment)
		.where(eq(donationCommitment.donationItemId, itemId));
	return Number(row?.value ?? 0);
}

test("a commitment stores one row with the item snapshot", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		const submissionId = id();
		const result = await createDonationService(
			joinedDatabase(transaction),
		).commit({ ...commitmentFor(seed, "2", submissionId) });
		assert.deepEqual(result, {
			outcome: "committed",
			reference: referenceFor(submissionId),
		});

		const [row] = await transaction
			.select()
			.from(donationCommitment)
			.where(eq(donationCommitment.submissionId, submissionId));
		assert.equal(row?.itemName, "Review item");
		assert.equal(row?.itemQuantity, "10");
		assert.equal(row?.quantity, "2");
		assert.equal(row?.note, null);
	});
});

test("the exact capacity is accepted; one more is oversold", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "3", step: "1" });
		const service = createDonationService(joinedDatabase(transaction));

		assert.equal(
			(await service.commit(commitmentFor(seed, "3"))).outcome,
			"committed",
		);
		assert.equal(
			(await service.commit(commitmentFor(seed, "1"))).outcome,
			"oversold",
		);
		assert.equal(await commitmentCount(transaction, seed.itemId), 1);
	});
});

test("a replayed submission writes once", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		const service = createDonationService(joinedDatabase(transaction));
		const input = commitmentFor(seed, "2");

		const first = await service.commit(input);
		const replay = await service.commit(input);

		assert.equal(first.outcome, "committed");
		assert.equal(replay.outcome, "committed");
		assert.equal(await commitmentCount(transaction, seed.itemId), 1);
	});
});

test("refused fills report their cause and write nothing", {
	skip,
}, async () => {
	assert.ok(admin);
	const cases: Array<{
		name: string;
		seed: Parameters<typeof seedDonation>[1];
		quantity: string;
		outcome: string;
	}> = [
		{
			name: "finished donation",
			seed: {
				quantity: "10",
				startsAt: new Date(Date.now() - 7_200_000),
				endsAt: new Date(Date.now() - 3_600_000),
			},
			quantity: "1",
			outcome: "inactive",
		},
		{
			name: "wrong increment",
			seed: { quantity: "10", step: "0.5" },
			quantity: "0.3",
			outcome: "invalid-increment",
		},
		{
			name: "oversold",
			seed: { quantity: "1", step: "1" },
			quantity: "2",
			outcome: "oversold",
		},
	];

	for (const scenario of cases) {
		await rolledBack(admin, async (transaction) => {
			const seed = await seedDonation(transaction, scenario.seed);
			const result = await createDonationService(
				joinedDatabase(transaction),
			).commit(commitmentFor(seed, scenario.quantity));
			assert.equal(result.outcome, scenario.outcome, scenario.name);
			assert.equal(await commitmentCount(transaction, seed.itemId), 0);
		});
	}
});

test("an unknown item is not-found and writes nothing", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		const result = await createDonationService(
			joinedDatabase(transaction),
		).commit({ ...commitmentFor(seed, "1"), itemId: id() });
		assert.equal(result.outcome, "not-found");
		assert.equal(await commitmentCount(transaction, seed.itemId), 0);
	});
});

test("the jublawoma role may commit through the production grants", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const seed = await seedDonation(transaction, { quantity: "10" });
		const submissionId = id();
		await asRole(transaction, "jublawoma", async () => {
			const result = await createDonationService(
				joinedDatabase(transaction),
			).commit({ ...commitmentFor(seed, "1", submissionId) });
			assert.equal(result.outcome, "committed");
		});
		assert.equal(await commitmentCount(transaction, seed.itemId), 1);
	});
});
