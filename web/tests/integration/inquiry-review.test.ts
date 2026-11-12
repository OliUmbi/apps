import assert from "node:assert/strict";
import test, { after } from "node:test";
import { count, eq } from "drizzle-orm";
import { errorCode } from "../../packages/contracts/src";
import type { Transaction } from "../../packages/database/src";
import { referenceFor } from "../../packages/queue/src/email";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import type { ReviewSubmissionInput } from "../../packages/unclet-data/src/forms";
import { createInquiryService as createUncletInquiryService } from "../../packages/unclet-data/src/inquiry.service";
import { createReviewService } from "../../packages/unclet-data/src/review.service";
import {
	review,
	inquiry as uncletInquiry,
} from "../../packages/unclet-data/src/schema";
import type { ContactInput } from "../../packages/zelglihof-data/src/forms";
import { createInquiryService as createZelglihofInquiryService } from "../../packages/zelglihof-data/src/inquiry.service";
import { inquiry as zelglihofInquiry } from "../../packages/zelglihof-data/src/schema";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	joinedDatabase,
	rolledBack,
} from "../support/database";
import { id, queuedEmails } from "../support/fixtures";

/*
 * The three public write paths against real PostgreSQL: the stored columns,
 * the transaction that makes the row and its queued emails commit together,
 * and the unique submission index that makes a replay write once. Each case
 * runs in a rolled-back transaction and creates its own rows.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

const uncletRequests = "anfrage@uncle-t.ch";
const zelglihofRequests = "hof@zelglihof.ch";

function uncletInquiryInput(submissionId = id()) {
	return {
		submissionId,
		name: "Ana Muster",
		email: "ana@example.com",
		phone: "079 123 45 67",
		date: "",
		location: "Mägenwil",
		guests: 12,
		note: "",
	};
}

function zelglihofInquiryInput(submissionId = id()): ContactInput {
	return {
		submissionId,
		name: "Ana Muster",
		email: "",
		phone: "079 123 45 67",
		subject: "other",
		message: "Guten Tag, ich habe eine Frage.",
	};
}

async function messagesFor(transaction: Transaction, recipient: string) {
	return transaction
		.select({
			subject: queuedMessage.subject,
			text: queuedMessage.text,
		})
		.from(queuedMessage)
		.where(eq(queuedMessage.recipient, recipient));
}

function reviewInput(submissionId = id()): ReviewSubmissionInput {
	return {
		submissionId,
		stars: 5,
		name: "Ana Muster",
		description: "Tolles Essen, sehr freundlich.",
	};
}

test("an unclet inquiry stores the submission and queues both emails", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = uncletInquiryInput();
		const service = createUncletInquiryService(
			joinedDatabase(transaction),
			uncletRequests,
		);
		let accepted: { outcome: string; reference: string } | undefined;
		await asRole(transaction, "unclet", async () => {
			accepted = await service.submit(input);
		});
		assert.deepEqual(accepted, {
			outcome: "accepted",
			reference: referenceFor(input.submissionId),
		});

		const [row] = await transaction
			.select()
			.from(uncletInquiry)
			.where(eq(uncletInquiry.submissionId, input.submissionId));
		assert.ok(row);
		assert.equal(row.status, "new");
		assert.equal(row.name, input.name);
		assert.equal(row.email, input.email);
		assert.equal(row.phone, input.phone);
		assert.equal(row.eventOn, null);
		assert.equal(row.location, input.location);
		assert.equal(row.guestCount, input.guests);
		assert.equal(row.note, null);

		assert.equal(await queuedEmails(transaction, uncletRequests), 1);
		assert.equal(await queuedEmails(transaction, input.email), 1);

		const reference = referenceFor(input.submissionId);
		const [adminMail] = await messagesFor(transaction, uncletRequests);
		for (const value of [
			input.name,
			input.email,
			input.phone,
			input.location,
			"12",
			reference,
		])
			assert.ok(adminMail?.text.includes(value), `admin mail lacks ${value}`);
		const [customerMail] = await messagesFor(transaction, input.email);
		assert.ok(customerMail?.text.includes(reference));
	});
});

test("a replayed unclet inquiry writes and queues once", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = uncletInquiryInput();
		const service = createUncletInquiryService(
			joinedDatabase(transaction),
			uncletRequests,
		);
		await asRole(transaction, "unclet", async () => {
			await service.submit(input);
			await service.submit(input);
		});

		const [row] = await transaction
			.select({ value: count() })
			.from(uncletInquiry)
			.where(eq(uncletInquiry.submissionId, input.submissionId));
		assert.equal(Number(row?.value), 1);
		assert.equal(await queuedEmails(transaction, uncletRequests), 1);
		assert.equal(await queuedEmails(transaction, input.email), 1);
	});
});

test("a zelglihof inquiry stores the submission and queues the admin email", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = zelglihofInquiryInput();
		const service = createZelglihofInquiryService(
			joinedDatabase(transaction),
			zelglihofRequests,
		);
		let accepted: { outcome: string; reference: string } | undefined;
		await asRole(transaction, "zelglihof", async () => {
			accepted = await service.submit(input);
		});
		assert.deepEqual(accepted, {
			outcome: "accepted",
			reference: referenceFor(input.submissionId),
		});

		const [row] = await transaction
			.select()
			.from(zelglihofInquiry)
			.where(eq(zelglihofInquiry.submissionId, input.submissionId));
		assert.ok(row);
		assert.equal(row.status, "new");
		assert.equal(row.subject, "other");
		assert.equal(row.name, input.name);
		assert.equal(row.phone, input.phone);
		assert.equal(row.email, null);
		assert.equal(row.message, input.message);

		assert.equal(await queuedEmails(transaction, zelglihofRequests), 1);

		const [adminMail] = await messagesFor(transaction, zelglihofRequests);
		assert.equal(adminMail?.subject, "Neue Hofanfrage");
		for (const value of [
			input.name,
			input.phone,
			input.message,
			referenceFor(input.submissionId),
		])
			assert.ok(adminMail?.text.includes(value), `admin mail lacks ${value}`);
		assert.match(adminMail.text, /Anliegen: Allgemein/);
	});
});

test("a replayed zelglihof inquiry writes and queues once", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = zelglihofInquiryInput();
		const service = createZelglihofInquiryService(
			joinedDatabase(transaction),
			zelglihofRequests,
		);
		await asRole(transaction, "zelglihof", async () => {
			await service.submit(input);
			await service.submit(input);
		});

		const [row] = await transaction
			.select({ value: count() })
			.from(zelglihofInquiry)
			.where(eq(zelglihofInquiry.submissionId, input.submissionId));
		assert.equal(Number(row?.value), 1);
		assert.equal(await queuedEmails(transaction, zelglihofRequests), 1);
	});
});

test("an unknown inquiry subject is a typed validation error", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = {
			...zelglihofInquiryInput(),
			subject: "nonsense",
		} as unknown as ContactInput;
		await assert.rejects(
			createZelglihofInquiryService(
				joinedDatabase(transaction),
				zelglihofRequests,
			).submit(input),
			(error) => errorCode(error) === "validation",
		);

		const [row] = await transaction
			.select({ value: count() })
			.from(zelglihofInquiry)
			.where(eq(zelglihofInquiry.submissionId, input.submissionId));
		assert.equal(Number(row?.value), 0);
	});
});

test("a review stores one moderation-hidden row", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = reviewInput();
		let outcome: string | undefined;
		await asRole(transaction, "unclet", async () => {
			outcome = (await createReviewService(transaction).submit(input)).outcome;
		});
		assert.equal(outcome, "accepted");

		const [row] = await transaction
			.select()
			.from(review)
			.where(eq(review.submissionId, input.submissionId));
		assert.ok(row);
		assert.equal(row.stars, input.stars);
		assert.equal(row.name, input.name);
		assert.equal(row.description, input.description);
		assert.equal(row.visible, false);
	});
});

test("invalid review fields are typed validation errors", {
	skip,
}, async () => {
	assert.ok(admin);
	const base = reviewInput();
	const cases: Array<{ label: string; input: ReviewSubmissionInput }> = [
		{
			label: "missing name",
			input: { ...base, name: undefined } as unknown as ReviewSubmissionInput,
		},
		{ label: "over-long name", input: { ...base, name: "x".repeat(121) } },
		{
			label: "over-long description",
			input: { ...base, description: "x".repeat(3_001) },
		},
		{ label: "stars outside the scale", input: { ...base, stars: 6 } },
	];

	for (const scenario of cases) {
		await rolledBack(admin, async (transaction) => {
			await assert.rejects(
				createReviewService(transaction).submit(scenario.input),
				(error) => errorCode(error) === "validation",
				scenario.label,
			);
			const [row] = await transaction
				.select({ value: count() })
				.from(review)
				.where(eq(review.submissionId, base.submissionId));
			assert.equal(Number(row?.value), 0, scenario.label);
		});
	}
});

test("a filled review honeypot writes nothing", { skip }, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const input = { ...reviewInput(), website: "https://spam.example" };
		let result: { outcome: string } | undefined;
		await asRole(transaction, "unclet", async () => {
			result = await createReviewService(transaction).submit(input);
		});
		assert.deepEqual(result, { outcome: "accepted" });

		const [row] = await transaction
			.select({ value: count() })
			.from(review)
			.where(eq(review.submissionId, input.submissionId));
		assert.equal(Number(row?.value), 0);
	});
});
