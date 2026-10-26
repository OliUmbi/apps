import assert from "node:assert/strict";
import test from "node:test";
import type { DatabasePool, Transaction } from "../packages/database/src";
import { createDonationService } from "../packages/jublawoma-data/src/donation.service";
import * as jublawomaForms from "../packages/jublawoma-data/src/forms";
import { commitmentSchema } from "../packages/jublawoma-data/src/forms";
import { referenceFor } from "../packages/queue/src/email";
import * as uncletForms from "../packages/unclet-data/src/forms";
import { inquirySchema, reviewSchema } from "../packages/unclet-data/src/forms";
import { createInquiryService as createUncletInquiryService } from "../packages/unclet-data/src/inquiry.service";
import {
	createReviewService,
	decideReview,
} from "../packages/unclet-data/src/review.service";
import * as zelglihofForms from "../packages/zelglihof-data/src/forms";
import {
	contactSchema,
	reservationSchema,
} from "../packages/zelglihof-data/src/forms";
import { createInquiryService as createZelglihofInquiryService } from "../packages/zelglihof-data/src/inquiry.service";
import { requestSubscription } from "../packages/zelglihof-data/src/newsletter.subscribe";
import { createReservationService } from "../packages/zelglihof-data/src/reservation.service";

/*
 * Abuse-resistance baseline (X-04 / J-10 / U-12 / Z-20): every public form
 * carries a `website` honeypot - a field humans never see. A filled value is
 * dropped by the service with the same success-shaped result a genuine fill
 * gets, while nothing is written: no submission row, no stock change, no
 * queued email. Rate limiting beyond the honeypot is the deliberate proxy gap
 * (see documentation/open-work.md technical debt).
 */

const submissionId = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";
const donationId = "0dce2f64-2ea1-4a2c-9d25-4dbb64834d01";
const itemId = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const productId = "3b9b0d5a-9d2c-4f0e-8f6a-1a2b3c4d5e6f";
const variantId = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const bot = "https://spam.example";
const options = {
	publicUrl: "http://localhost:8003",
	sender: "newsletter@zelglihof.ch",
	replyTo: "hof@zelglihof.ch",
};

const commitment = {
	submissionId,
	donationId,
	itemId,
	name: "Ana Muster",
	phone: "079 123 45 67",
	quantity: "5",
	note: "",
};
const inquiry = {
	submissionId,
	name: "Ana Muster",
	email: "ana@example.com",
	phone: "079 123 45 67",
	date: "",
	location: "Mägenwil",
	guests: 12,
	note: "",
};
const review = {
	submissionId,
	stars: 5,
	name: "Ana Muster",
	description: "Tolles Essen, sehr freundlich.",
};
const contact = {
	submissionId,
	name: "Ana Muster",
	email: "",
	phone: "079 123 45 67",
	subject: "other" as const,
	message: "Guten Tag, ich habe eine Frage.",
};
const reservation = {
	submissionId,
	productId,
	variantId,
	name: "Ana Muster",
	email: "",
	phone: "079 123 45 67",
	quantity: 2,
	note: "",
};

test("every public form schema declares the honeypot field", () => {
	// Iterates every shape-bearing schema export of the three forms modules, so
	// a new public form cannot land without its honeypot.
	const expected = [
		"jublawoma.commitmentSchema",
		"unclet.inquirySchema",
		"unclet.reviewSchema",
		"zelglihof.contactSchema",
		"zelglihof.newsletterSignupSchema",
		"zelglihof.reservationSchema",
	];
	const seen: string[] = [];
	for (const [site, module] of [
		["jublawoma", jublawomaForms],
		["unclet", uncletForms],
		["zelglihof", zelglihofForms],
	] as const) {
		for (const [name, value] of Object.entries(module)) {
			const shape = (value as unknown as { shape?: unknown }).shape;
			if (!shape || typeof shape !== "object") continue;
			seen.push(`${site}.${name}`);
			assert.ok(
				"website" in (shape as Record<string, unknown>),
				`${site}.${name} lacks the website honeypot`,
			);
		}
	}
	assert.deepEqual(seen.sort(), expected);
});

function honeypotParses(
	schema: { safeParse(value: unknown): { success: boolean } },
	base: Record<string, unknown>,
) {
	assert.equal(schema.safeParse(base).success, true, "omitted honeypot parses");
	assert.equal(
		schema.safeParse({ ...base, website: "" }).success,
		true,
		"empty honeypot parses",
	);
	assert.equal(
		schema.safeParse({ ...base, website: bot }).success,
		true,
		"a filled honeypot parses so the service can drop it silently",
	);
}

test("a filled honeypot parses in every schema, an empty or omitted one is normal", () => {
	honeypotParses(commitmentSchema, commitment);
	honeypotParses(inquirySchema, inquiry);
	honeypotParses(reviewSchema, review);
	honeypotParses(contactSchema, contact);
	honeypotParses(reservationSchema, reservation);
	honeypotParses(zelglihofForms.newsletterSignupSchema, {
		email: "ana@example.com",
	});
});

test("the review plan drops a filled honeypot silently", () => {
	assert.deepEqual(decideReview({ honeypot: true }), {
		outcome: "accepted",
		insert: false,
	});
	assert.deepEqual(decideReview({ honeypot: false }), {
		outcome: "accepted",
		insert: true,
	});
});

/*
 * The fake stands in at the drizzle seam like campaign-saved-draft.test.ts:
 * every operation through the one transaction is recorded, so "nothing was
 * written, decremented or queued" is observable, and each select can be
 * answered in turn (lock, replay lookup, totals).
 */
function fakeDatabase(selectAnswers: unknown[][] = []) {
	const log = {
		transactions: 0,
		operations: [] as string[],
		inserts: [] as unknown[][],
		updates: 0,
	};
	let selectRun = 0;
	const chain = (finish: (values: unknown[]) => unknown) => {
		const values: unknown[] = [];
		const api: Record<string, unknown> = {};
		const step =
			(name: string) =>
			(...input: unknown[]) => {
				if (name === "values") values.push(input[0]);
				return api;
			};
		for (const name of [
			"select",
			"insert",
			"update",
			"execute",
			"from",
			"innerJoin",
			"where",
			"orderBy",
			"limit",
			"set",
			"values",
			"for",
			"onConflictDoNothing",
			"onConflictDoUpdate",
			"returning",
		])
			api[name] = step(name);
		// biome-ignore lint/suspicious/noThenProperty: the fake is deliberately a thenable: awaiting it runs the recorded query
		api.then = (resolve: (value: unknown) => unknown) =>
			Promise.resolve(finish(values)).then(resolve);
		return api;
	};
	const transaction = {
		select: () => {
			log.operations.push("select");
			const answer = selectAnswers[selectRun++] ?? [];
			return chain(() => answer);
		},
		insert: () => {
			log.operations.push("insert");
			return chain((values) => {
				log.inserts.push(values);
				return [{ id: `row-${log.inserts.length}` }];
			});
		},
		update: () => {
			log.operations.push("update");
			log.updates += 1;
			return chain(() => undefined);
		},
		execute: () => {
			log.operations.push("execute");
			return chain(() => undefined);
		},
	} as unknown as Transaction;
	const database = {
		role: "postgres",
		db: transaction,
		transaction: <T>(work: (inner: Transaction) => Promise<T>) => {
			log.transactions += 1;
			return work(transaction);
		},
		close: async () => {},
	} as unknown as DatabasePool;
	return { database, transaction, log };
}

test("a filled honeypot writes no row, moves no stock and queues no email", async () => {
	const reference = referenceFor(submissionId);

	const donation = fakeDatabase();
	assert.deepEqual(
		await createDonationService(donation.database).commit({
			...commitment,
			website: bot,
		}),
		{ outcome: "committed", reference },
	);

	const uncletInquiry = fakeDatabase();
	assert.deepEqual(
		await createUncletInquiryService(
			uncletInquiry.database,
			"info@uncle-t.ch",
		).submit({ ...inquiry, website: bot }),
		{ outcome: "accepted", reference },
	);

	const zelglihofInquiry = fakeDatabase();
	assert.deepEqual(
		await createZelglihofInquiryService(
			zelglihofInquiry.database,
			"hof@zelglihof.ch",
		).submit({ ...contact, website: bot }),
		{ outcome: "accepted", reference },
	);

	const reservationRun = fakeDatabase();
	assert.deepEqual(
		await createReservationService(
			reservationRun.database,
			"hof@zelglihof.ch",
		).reserve({ ...reservation, website: bot }),
		{ outcome: "reserved", reference },
	);

	// The honeypot drop happens before the transaction: not one query runs.
	for (const run of [
		donation,
		uncletInquiry,
		zelglihofInquiry,
		reservationRun,
	]) {
		assert.deepEqual(run.log, {
			transactions: 0,
			operations: [],
			inserts: [],
			updates: 0,
		});
	}
});

test("a filled honeypot review or signup reports success and touches nothing", async () => {
	const reviewRun = fakeDatabase();
	assert.deepEqual(
		await createReviewService(reviewRun.transaction).submit({
			...review,
			website: bot,
		}),
		{ outcome: "accepted" },
	);

	const signupRun = fakeDatabase();
	assert.deepEqual(
		await requestSubscription(
			signupRun.database,
			options,
			"bot@example.com",
			bot,
		),
		{ outcome: "confirmation-sent" },
	);

	for (const run of [reviewRun, signupRun]) {
		assert.deepEqual(run.log, {
			transactions: 0,
			operations: [],
			inserts: [],
			updates: 0,
		});
	}
});

function isEmail(payload: unknown) {
	return (payload as { type?: string }).type === "email";
}

test("an empty honeypot leaves every normal flow unchanged", async () => {
	const reference = referenceFor(submissionId);

	// The commitment stores one row and moves no stock of its own.
	const donation = fakeDatabase([
		[
			{
				title: "Ernte",
				name: "Brot",
				detail: null,
				quantity: "10",
				step: "1",
				unit: "Stk",
				active: true,
			},
		],
		[],
		[{ quantity: "0" }],
	]);
	assert.deepEqual(
		await createDonationService(donation.database).commit({
			...commitment,
			website: "",
		}),
		{ outcome: "committed", reference },
	);
	assert.equal(donation.log.inserts.length, 1);
	assert.equal(
		(donation.log.inserts[0][0] as { submissionId?: string }).submissionId,
		submissionId,
	);

	// The inquiry stores one row and queues the admin and customer emails.
	const uncletInquiry = fakeDatabase([[]]);
	assert.deepEqual(
		await createUncletInquiryService(
			uncletInquiry.database,
			"info@uncle-t.ch",
		).submit({ ...inquiry, website: "" }),
		{ outcome: "accepted", reference },
	);
	assert.equal(uncletInquiry.log.inserts.length, 3);
	assert.equal(
		(uncletInquiry.log.inserts[0][0] as { submissionId?: string }).submissionId,
		submissionId,
	);
	assert.equal(isEmail(uncletInquiry.log.inserts[1][0]), true);
	assert.equal(isEmail(uncletInquiry.log.inserts[2][0]), true);

	// The zelglihof inquiry stores one row and queues one notification email.
	const zelglihofInquiry = fakeDatabase([[]]);
	assert.deepEqual(
		await createZelglihofInquiryService(
			zelglihofInquiry.database,
			"hof@zelglihof.ch",
		).submit({ ...contact, website: "" }),
		{ outcome: "accepted", reference },
	);
	assert.equal(zelglihofInquiry.log.inserts.length, 2);
	assert.equal(
		(zelglihofInquiry.log.inserts[0][0] as { submissionId?: string })
			.submissionId,
		submissionId,
	);
	assert.equal(isEmail(zelglihofInquiry.log.inserts[1][0]), true);

	// The review stores its row moderation-hidden (`visible: false`).
	const reviewRun = fakeDatabase();
	assert.deepEqual(
		await createReviewService(reviewRun.transaction).submit({
			...review,
			website: "",
		}),
		{ outcome: "accepted" },
	);
	assert.equal(reviewRun.log.inserts.length, 1);
	assert.equal(
		(reviewRun.log.inserts[0][0] as { visible?: boolean }).visible,
		false,
	);

	// The reservation stores one row, decrements stock and queues one email.
	const reservationRun = fakeDatabase([
		[
			{
				productName: "Kiste",
				variantName: "Gross",
				description: null,
				price: "20",
				quantity: 5,
				available: true,
			},
		],
		[],
	]);
	assert.deepEqual(
		await createReservationService(
			reservationRun.database,
			"hof@zelglihof.ch",
		).reserve({ ...reservation, website: "" }),
		{ outcome: "reserved", reference },
	);
	assert.equal(reservationRun.log.inserts.length, 2);
	assert.equal(reservationRun.log.updates, 1);
	assert.equal(
		(reservationRun.log.inserts[0][0] as { submissionId?: string })
			.submissionId,
		submissionId,
	);
	assert.equal(isEmail(reservationRun.log.inserts[1][0]), true);

	// The signup stores one subscriber and queues one confirmation email.
	const signupRun = fakeDatabase([[]]);
	assert.deepEqual(
		await requestSubscription(
			signupRun.database,
			options,
			"ana@example.com",
			"",
		),
		{ outcome: "confirmation-sent" },
	);
	assert.equal(signupRun.log.inserts.length, 2);
	assert.equal(
		(signupRun.log.inserts[0][0] as { confirmationTokenHash?: string })
			.confirmationTokenHash !== undefined,
		true,
	);
	assert.equal(isEmail(signupRun.log.inserts[1][0]), true);
	assert.equal(
		signupRun.log.operations.filter((op) => op === "execute").length,
		1,
	);
});
