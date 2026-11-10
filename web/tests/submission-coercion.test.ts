import assert from "node:assert/strict";
import test from "node:test";
import type { CommitmentInput } from "../packages/jublawoma-data/src/forms";
import {
	coerceSubmissionValues,
	type SubmissionField,
	type SubmissionFieldName,
} from "../packages/ui/src/submission-types";
import type {
	InquirySubmissionInput,
	ReviewSubmissionInput,
} from "../packages/unclet-data/src/forms";
import type { ReservationInput } from "../packages/zelglihof-data/src/forms";

const id = "11111111-1111-4111-8111-111111111111";

/*
 * Compile-time contract: field names and defaults are keyed by the schema input
 * type, so a renamed domain field breaks compilation. `pnpm typecheck` checks
 * these guards; each `@ts-expect-error` fails the build when its rename starts
 * to compile again. Exported so the guards stay live without runtime asserts.
 */
type ReservationDefaults = Partial<
	Record<SubmissionFieldName<ReservationInput>, unknown>
>;
const renamedFieldLiteral = {
	name: "quantaty",
	kind: "number",
	label: "Menge",
};
// @ts-expect-error a renamed domain field must not compile
export const renamedField: SubmissionField<ReservationInput> =
	renamedFieldLiteral;
const renamedDefaultLiteral = { quantaty: 1 };
// @ts-expect-error a renamed domain key in defaults must not compile
export const renamedDefault: ReservationDefaults = renamedDefaultLiteral;

// Field lists are the other half of the contract: a renamed key in a site's
// field set must not compile either.
export const commitmentFields = [
	{ name: "name", kind: "text", label: "Name" },
	{ name: "phone", kind: "tel", label: "Telefon" },
	{ name: "quantity", kind: "decimal-string", label: "Menge" },
	{ name: "note", kind: "textarea", rows: 5, label: "Notiz" },
] satisfies ReadonlyArray<SubmissionField<CommitmentInput>>;

export const reservationFields = [
	{ name: "productId", kind: "select", options: [], label: "Produkt" },
	{ name: "name", kind: "text", label: "Name" },
	{ name: "email", kind: "email", label: "E-Mail" },
	{ name: "quantity", kind: "number", min: 1, max: 100, label: "Menge" },
	{ name: "note", kind: "textarea", label: "Notiz" },
] satisfies ReadonlyArray<SubmissionField<ReservationInput>>;

export const reviewFields = [
	{ name: "stars", kind: "rating", max: 5, label: "Sterne" },
	{ name: "description", kind: "textarea", label: "Beschreibung" },
] satisfies ReadonlyArray<SubmissionField<ReviewSubmissionInput>>;

test("coercion derives from the field kind, not from a name list", () => {
	const form = new FormData();
	form.set("guests", "12");
	form.set("date", "2026-11-01");
	const values = coerceSubmissionValues<InquirySubmissionInput>(
		form,
		[
			{ name: "guests", kind: "number", label: "Gäste" },
			{ name: "date", kind: "date", label: "Datum" },
		],
		{},
	);
	assert.deepEqual(values, { guests: 12, date: "2026-11-01" });

	const decimals = new FormData();
	decimals.set("quantity", "2.50");
	assert.deepEqual(
		coerceSubmissionValues<CommitmentInput>(
			decimals,
			[{ name: "quantity", kind: "decimal-string", label: "Menge" }],
			{},
		),
		// Quantities stay decimal strings (D2); float64 must never touch them.
		{ quantity: "2.50" },
	);

	const stars = new FormData();
	stars.set("stars", "4");
	assert.deepEqual(
		coerceSubmissionValues<ReviewSubmissionInput>(
			stars,
			[{ name: "stars", kind: "rating", max: 5, label: "Sterne" }],
			{},
		),
		{ stars: 4 },
	);
});

test("checkbox payloads are booleans derived from presence", () => {
	const fields: readonly SubmissionField<Record<string, unknown>>[] = [
		{ name: "terms", kind: "checkbox", label: "Bedingungen" },
	];
	const checked = new FormData();
	checked.set("terms", "on");
	assert.deepEqual(coerceSubmissionValues(checked, fields, { terms: true }), {
		terms: true,
	});
	const unchecked = new FormData();
	assert.deepEqual(coerceSubmissionValues(unchecked, fields, { terms: true }), {
		terms: false,
	});
});

test("defaults merge under submitted values and survive hidden fields", () => {
	const form = new FormData();
	form.set("name", "Anna");
	const values = coerceSubmissionValues<CommitmentInput>(
		form,
		[{ name: "name", kind: "text", label: "Name" }],
		{ submissionId: id, donationId: id, itemId: id, name: "Default" },
	);
	assert.deepEqual(values, {
		submissionId: id,
		donationId: id,
		itemId: id,
		name: "Anna",
	});
});
