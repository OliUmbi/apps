import assert from "node:assert/strict";
import test from "node:test";
import {
	type CommitmentInput,
	commitmentSchema,
} from "../packages/jublawoma-data/src/forms";
import {
	type SubmissionErrorReason,
	type SubmissionIssue,
	submissionErrors,
} from "../packages/ui/src/submission-types";
import {
	type InquirySubmissionInput,
	inquirySchema,
	type ReviewSubmissionInput,
	reviewSchema,
} from "../packages/unclet-data/src/forms";

/*
 * The zod-to-reason mapping at the form boundary: empty values read as
 * `required`, string bounds split from numeric bounds, and issues without a
 * field path land on the form-level banner.
 */

const id = "11111111-1111-4111-8111-111111111111";

// The slice of a zod schema this test needs, without importing zod's types.
interface ParseableSchema {
	safeParse(value: unknown): {
		success: boolean;
		error?: { issues: readonly SubmissionIssue[] };
	};
}

const commitmentBase = {
	submissionId: id,
	donationId: id,
	itemId: id,
	note: "",
};
const reviewBase = {
	submissionId: id,
	stars: 4,
	name: "Anna Meier",
	description: "super",
};
const inquiryBase = {
	submissionId: id,
	name: "Anna Meier",
	email: "a@b.ch",
	phone: "079",
	date: "",
	location: "",
	guests: 12,
	note: "",
};

function assertReasons<Input>(
	schema: ParseableSchema,
	values: Record<string, unknown>,
	fields: Record<string, unknown>,
	form: SubmissionErrorReason | null = null,
) {
	const result = schema.safeParse(values);
	if (result.success || !result.error) assert.fail("fixture must reject");
	const errors = submissionErrors<Input>(result.error.issues, values);
	assert.deepEqual(errors, { fields, form });
}

test("empty and unattributable issues map to required and the form banner", () => {
	assertReasons<CommitmentInput>(
		commitmentSchema,
		{ ...commitmentBase },
		{
			name: "required",
			phone: "required",
			quantity: "required",
		},
	);

	assertReasons<ReviewSubmissionInput>(
		reviewSchema,
		{ ...reviewBase, name: "" },
		{ name: "required" },
	);

	// An extra key has no field path: its reason belongs to the form banner.
	assertReasons<ReviewSubmissionInput>(
		reviewSchema,
		{ ...reviewBase, extra: 1 },
		{},
		"invalid",
	);
});

test("string and numeric bounds map to their reasons", () => {
	assertReasons<CommitmentInput>(
		commitmentSchema,
		{
			...commitmentBase,
			name: "a",
			phone: "079",
			quantity: "1",
			note: "x".repeat(4_000),
		},
		{ name: "too_short", note: "too_long" },
	);

	const formatValues = {
		...commitmentBase,
		name: "Anna",
		phone: "079",
		quantity: "abc",
	};
	assertReasons<CommitmentInput>(commitmentSchema, formatValues, {
		quantity: "invalid",
	});
	assertReasons<CommitmentInput>(
		commitmentSchema,
		{ ...formatValues, quantity: "0" },
		{ quantity: "custom" },
	);

	assertReasons<InquirySubmissionInput>(
		inquirySchema,
		{
			...inquiryBase,
			email: "not-an-email",
			date: "gestern",
			guests: 0,
		},
		{ email: "invalid", date: "invalid", guests: "range" },
	);

	assertReasons<ReviewSubmissionInput>(
		reviewSchema,
		{ ...reviewBase, stars: 9 },
		{ stars: "range" },
	);
});

test("issue codes map deterministically and the first issue per field wins", () => {
	const reasonFor = (issue: SubmissionIssue, value: unknown) => {
		const key = String(issue.path[0]);
		return submissionErrors<Record<string, unknown>>([issue], {
			[key]: value,
		}).fields[key];
	};
	const cases: [SubmissionIssue, unknown, string][] = [
		[{ code: "invalid_type", path: ["a"] }, undefined, "required"],
		[{ code: "invalid_type", path: ["b"] }, "x", "invalid"],
		[{ code: "too_small", path: ["c"], origin: "string" }, "", "required"],
		[{ code: "too_small", path: ["d"], origin: "string" }, "ab", "too_short"],
		[{ code: "too_small", path: ["e"], origin: "number" }, 0, "range"],
		[{ code: "too_big", path: ["f"], origin: "string" }, "abc", "too_long"],
		[{ code: "too_big", path: ["g"], origin: "number" }, 5, "range"],
		[{ code: "not_multiple_of", path: ["h"] }, 1, "range"],
		[{ code: "custom", path: ["i"] }, 1, "custom"],
		[{ code: "future_code", path: ["j"] }, 1, "invalid"],
	];
	for (const [issue, value, expected] of cases)
		assert.equal(reasonFor(issue, value), expected, issue.code);

	const firstWins = submissionErrors<Record<string, unknown>>(
		[
			{ code: "too_small", path: ["d"], origin: "string" },
			{ code: "too_big", path: ["d"], origin: "string" },
			{ code: "unrecognized_keys", path: [] },
		],
		{ d: "ab" },
	);
	assert.equal(firstWins.fields.d, "too_short");
	assert.equal(firstWins.form, "invalid");
});
