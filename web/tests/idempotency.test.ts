import assert from "node:assert/strict";
import test from "node:test";
import { decideCommitment } from "../packages/jublawoma-data/src/donation.service";
import {
	commitmentSchema,
	decimalSchema,
} from "../packages/jublawoma-data/src/forms";
import { referenceFor } from "../packages/queue/src/email";
import { inquirySchema } from "../packages/unclet-data/src/forms";
import { decideInquiry as decideUncletInquiry } from "../packages/unclet-data/src/inquiry.service";
import {
	contactSchema,
	reservationSchema,
} from "../packages/zelglihof-data/src/forms";
import { decideInquiry as decideZelglihofInquiry } from "../packages/zelglihof-data/src/inquiry.service";
import { decideReservation } from "../packages/zelglihof-data/src/reservation.service";

const submissionId = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";

test("support reference derives from the submission id and is stable across retries", () => {
	const reference = referenceFor(submissionId);
	assert.equal(reference, referenceFor(submissionId));
	assert.match(reference, /^[0-9A-F]{12}$/);
	assert.notEqual(reference, submissionId.slice(0, 12).toUpperCase());
	assert.notEqual(
		reference,
		referenceFor("0dce2f64-2ea1-4a2c-9d25-4dbb64834d01"),
	);
	assert.notEqual(
		reference,
		referenceFor("7c9e6679-7425-40de-944b-e07fc1f90ae7"),
	);
});

test("a replayed submission reports the original outcome and writes nothing", () => {
	assert.deepEqual(
		decideCommitment({
			replayed: true,
			item: { active: false, quantity: "0", step: "0" },
			quantity: "5",
			committed: "999",
		}),
		{ outcome: "committed", insert: false },
	);
	assert.deepEqual(
		decideReservation({
			replayed: true,
			available: false,
			stock: 0,
			quantity: 5,
		}),
		{ outcome: "reserved", insert: false },
	);
	assert.deepEqual(decideUncletInquiry({ replayed: true }), {
		outcome: "accepted",
		insert: false,
	});
	assert.deepEqual(decideZelglihofInquiry({ replayed: true }), {
		outcome: "accepted",
		insert: false,
	});
});

test("a fresh fill inserts exactly once", () => {
	assert.deepEqual(
		decideCommitment({
			replayed: false,
			item: { active: true, quantity: "10", step: "1" },
			quantity: "5",
			committed: "2",
		}),
		{ outcome: "committed", insert: true },
	);
	assert.deepEqual(
		decideReservation({
			replayed: false,
			available: true,
			stock: 3,
			quantity: 2,
		}),
		{ outcome: "reserved", insert: true },
	);
	assert.deepEqual(
		decideReservation({
			replayed: false,
			available: true,
			stock: 1,
			quantity: 2,
		}),
		{ outcome: "unavailable", insert: false },
	);
	assert.deepEqual(decideUncletInquiry({ replayed: false }), {
		outcome: "accepted",
		insert: true,
	});
});

test("public form schemas require the submission id and keep quantities as strings", () => {
	const commitment = {
		donationId: submissionId,
		itemId: "0dce2f64-2ea1-4a2c-9d25-4dbb64834d01",
		name: "Ana Muster",
		phone: "079 123 45 67",
		quantity: "0.5",
		note: "",
	};
	assert.equal(commitmentSchema.safeParse(commitment).success, false);
	const accepted = commitmentSchema.parse({ ...commitment, submissionId });
	assert.equal(accepted.submissionId, submissionId);
	assert.equal(typeof accepted.quantity, "string");
	assert.equal(decimalSchema.safeParse(0.5).success, false);
	assert.equal(
		reservationSchema.safeParse({
			submissionId,
			productId: "0dce2f64-2ea1-4a2c-9d25-4dbb64834d01",
			variantId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
			name: "Ana Muster",
			email: "",
			phone: "079 123 45 67",
			quantity: 2,
			note: "",
		}).success,
		true,
	);
	assert.equal(
		inquirySchema.safeParse({
			name: "Ana Muster",
			email: "ana@example.com",
			phone: "079 123 45 67",
			date: "",
			location: "Mägenwil",
			guests: 12,
			note: "",
		}).success,
		false,
	);
	assert.equal(
		contactSchema.safeParse({
			submissionId,
			name: "Ana Muster",
			email: "",
			phone: "079 123 45 67",
			subject: "other",
			message: "Guten Tag, ich habe eine Frage.",
		}).success,
		true,
	);
});
