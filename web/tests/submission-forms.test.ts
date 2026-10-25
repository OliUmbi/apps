import assert from "node:assert/strict";
import test from "node:test";
import {
	type CommitmentInput,
	commitmentSchema,
} from "../packages/jublawoma-data/src/forms";
import {
	coerceSubmissionValues,
	type SubmissionField,
	type SubmissionFieldName,
	submissionErrors,
} from "../packages/ui/src/submission-types";
import {
	type InquirySubmissionInput,
	inquirySchema,
	type ReviewSubmissionInput,
	reviewSchema,
} from "../packages/unclet-data/src/forms";
import type { ReservationInput } from "../packages/zelglihof-data/src/forms";

const id = "11111111-1111-4111-8111-111111111111";

/*
 * Compile-time contract: names and defaults are keyed by the schema input type,
 * so a renamed domain field breaks compilation. `pnpm typecheck` runs these
 * guards; each `@ts-expect-error` fails the build when its rename stops
 * breaking.
 */
const quantityName: SubmissionFieldName<CommitmentInput> = "quantity";
const renamedFieldName = { name: "quantaty", kind: "number", label: "Menge" };
// @ts-expect-error a renamed domain field must not compile
const renamedField: SubmissionField<ReservationInput> = renamedFieldName;
type ReservationDefaults = Partial<
	Record<SubmissionFieldName<ReservationInput>, unknown>
>;
// @ts-expect-error a renamed domain key in defaults must not compile
const renamedDefault: ReservationDefaults = { quantaty: 1 };

const commitmentFields = [
	{ name: "name", kind: "text", label: "Name" },
	{ name: "phone", kind: "tel", label: "Telefon" },
	{ name: "quantity", kind: "decimal-string", label: "Menge" },
	{ name: "note", kind: "textarea", rows: 5, label: "Notiz" },
] satisfies ReadonlyArray<SubmissionField<CommitmentInput>>;

const reservationFields = [
	{ name: "productId", kind: "select", options: [], label: "Produkt" },
	{ name: "name", kind: "text", label: "Name" },
	{ name: "email", kind: "email", label: "E-Mail" },
	{ name: "quantity", kind: "number", min: 1, max: 100, label: "Menge" },
	{ name: "note", kind: "textarea", label: "Notiz" },
] satisfies ReadonlyArray<SubmissionField<ReservationInput>>;

const reviewFields = [
	{ name: "stars", kind: "rating", max: 5, label: "Sterne" },
	{ name: "description", kind: "textarea", label: "Beschreibung" },
] satisfies ReadonlyArray<SubmissionField<ReviewSubmissionInput>>;

test("field descriptors type-check against the schema input types", () => {
	assert.equal(quantityName, "quantity");
	assert.equal(commitmentFields[2].kind, "decimal-string");
	assert.equal(reservationFields.length, 5);
	assert.equal(reviewFields.length, 2);
	assert.equal(renamedField, renamedFieldName);
	assert.deepEqual(renamedDefault, { quantaty: 1 });
});

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

test("zod issues map to per-field reasons", () => {
	const values = { submissionId: id, donationId: id, itemId: id, note: "" };
	const missing = commitmentSchema.safeParse(values);
	assert.equal(missing.success, false);
	const missingErrors = submissionErrors<CommitmentInput>(
		missing.success ? [] : missing.error.issues,
		values,
	);
	assert.deepEqual(missingErrors.fields, {
		name: "required",
		phone: "required",
		quantity: "required",
	});
	assert.equal(missingErrors.form, null);

	const emptyValues = {
		submissionId: id,
		stars: 4,
		name: "",
		description: "super",
	};
	const emptyName = reviewSchema.safeParse(emptyValues);
	assert.equal(emptyName.success, false);
	assert.equal(
		submissionErrors<ReviewSubmissionInput>(
			emptyName.success ? [] : emptyName.error.issues,
			emptyValues,
		).fields.name,
		"required",
	);

	const sizeValues = {
		submissionId: id,
		donationId: id,
		itemId: id,
		name: "a",
		phone: "079",
		quantity: "1",
		note: "x".repeat(4_000),
	};
	const shortAndLong = commitmentSchema.safeParse(sizeValues);
	assert.equal(shortAndLong.success, false);
	const sizeErrors = submissionErrors<CommitmentInput>(
		shortAndLong.success ? [] : shortAndLong.error.issues,
		sizeValues,
	);
	assert.equal(sizeErrors.fields.name, "too_short");
	assert.equal(sizeErrors.fields.note, "too_long");

	const formatValues = {
		submissionId: id,
		donationId: id,
		itemId: id,
		name: "Anna",
		phone: "079",
		quantity: "abc",
		note: "",
	};
	const badFormat = commitmentSchema.safeParse(formatValues);
	assert.equal(badFormat.success, false);
	assert.equal(
		submissionErrors<CommitmentInput>(
			badFormat.success ? [] : badFormat.error.issues,
			formatValues,
		).fields.quantity,
		"invalid",
	);

	const zeroValues = { ...formatValues, quantity: "0" };
	const zeroQuantity = commitmentSchema.safeParse(zeroValues);
	assert.equal(zeroQuantity.success, false);
	assert.equal(
		submissionErrors<CommitmentInput>(
			zeroQuantity.success ? [] : zeroQuantity.error.issues,
			zeroValues,
		).fields.quantity,
		"custom",
	);
});

test("numeric bounds map to range and bad values map to invalid", () => {
	const fewValues = {
		submissionId: id,
		name: "Anna Meier",
		email: "a@b.ch",
		phone: "079",
		date: "",
		location: "",
		guests: 0,
		note: "",
	};
	const tooFew = inquirySchema.safeParse(fewValues);
	assert.equal(tooFew.success, false);
	assert.equal(
		submissionErrors<InquirySubmissionInput>(
			tooFew.success ? [] : tooFew.error.issues,
			fewValues,
		).fields.guests,
		"range",
	);

	const badValues = {
		submissionId: id,
		name: "Anna Meier",
		email: "not-an-email",
		phone: "079",
		date: "gestern",
		location: "",
		guests: "zwölf",
		note: "",
	};
	const invalid = inquirySchema.safeParse(badValues);
	assert.equal(invalid.success, false);
	const invalidErrors = submissionErrors<InquirySubmissionInput>(
		invalid.success ? [] : invalid.error.issues,
		badValues,
	);
	assert.equal(invalidErrors.fields.email, "invalid");
	assert.equal(invalidErrors.fields.date, "invalid");
	assert.equal(invalidErrors.fields.guests, "invalid");

	const starValues = {
		submissionId: id,
		stars: 9,
		name: "Anna Meier",
		description: "super",
	};
	const badStars = reviewSchema.safeParse(starValues);
	assert.equal(badStars.success, false);
	assert.equal(
		submissionErrors<ReviewSubmissionInput>(
			badStars.success ? [] : badStars.error.issues,
			starValues,
		).fields.stars,
		"range",
	);
});

test("unattributable issues keep their reason on the form level", () => {
	const extraValues = {
		submissionId: id,
		stars: 4,
		name: "Anna Meier",
		description: "super",
		extra: 1,
	};
	const extraKey = reviewSchema.safeParse(extraValues);
	assert.equal(extraKey.success, false);
	const errors = submissionErrors<ReviewSubmissionInput>(
		extraKey.success ? [] : extraKey.error.issues,
		extraValues,
	);
	assert.deepEqual(errors.fields, {});
	assert.equal(errors.form, "invalid");
});

test("every reason branch maps deterministically and first issue wins", () => {
	const errors = submissionErrors<Record<string, unknown>>(
		[
			{ code: "invalid_type", path: ["a"] },
			{ code: "invalid_type", path: ["b"] },
			{ code: "too_small", path: ["c"], origin: "string" },
			{ code: "too_small", path: ["d"], origin: "string" },
			{ code: "too_small", path: ["e"], origin: "number" },
			{ code: "too_big", path: ["f"], origin: "string" },
			{ code: "too_big", path: ["g"], origin: "number" },
			{ code: "not_multiple_of", path: ["h"] },
			{ code: "custom", path: ["i"] },
			{ code: "future_code", path: ["j"] },
			{ code: "too_big", path: ["d"], origin: "string" },
			{ code: "unrecognized_keys", path: [] },
		],
		{
			a: undefined,
			b: "x",
			c: "",
			d: "ab",
			e: 0,
			f: "abc",
			g: 5,
			h: 1,
			i: 1,
			j: 1,
		},
	);
	assert.deepEqual(errors.fields, {
		a: "required",
		b: "invalid",
		c: "required",
		d: "too_short",
		e: "range",
		f: "too_long",
		g: "range",
		h: "range",
		i: "custom",
		j: "invalid",
	});
	assert.equal(errors.form, "invalid");
});
