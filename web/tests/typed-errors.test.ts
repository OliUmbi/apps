import assert from "node:assert/strict";
import test from "node:test";
import {
	AppError,
	constraintViolation,
	deriveErrorCode,
	type ErrorCode,
	errorCode,
	guardRepository,
	isAppError,
	mapErrors,
	recordNotCreatedError,
	toAppError,
} from "../packages/contracts/src";
import {
	createHttpClient,
	parseProblemBody,
	ServiceError,
} from "../packages/http-client/src";
import {
	ConcurrentUpdateError,
	isConcurrentUpdateError,
	RecordKeyMismatchError,
	updateMissError,
} from "../packages/jublawoma-data/src/content/errors";

/*
 * The typed-error model: no raw Error, ZodError, or database driver error
 * crosses a package boundary, and every failure carries a code callers can
 * branch on (sign-in vs retry vs conflict vs not-found vs validation).
 */

test("problem bodies parse to the safe fields and nothing else", () => {
	const full = parseProblemBody({
		errorId: " 9f0d-42 ",
		detail: "Mailbox is full",
		errors: [
			{ field: "email", message: "Already subscribed" },
			{ field: "name", message: "Required" },
		],
	});
	assert.deepEqual(full, {
		errorId: "9f0d-42",
		detail: "Mailbox is full",
		fields: [
			{ field: "email", message: "Already subscribed" },
			{ field: "name", message: "Required" },
		],
	});
	// Malformed shapes degrade to the empty problem; raw text is never kept.
	assert.deepEqual(parseProblemBody(null), {
		errorId: null,
		detail: null,
		fields: [],
	});
	assert.deepEqual(parseProblemBody("plain text"), {
		errorId: null,
		detail: null,
		fields: [],
	});
	assert.deepEqual(parseProblemBody([1, 2, 3]), {
		errorId: null,
		detail: null,
		fields: [],
	});
	assert.deepEqual(parseProblemBody({ errorId: 5, detail: {} }), {
		errorId: null,
		detail: null,
		fields: [],
	});
	assert.deepEqual(parseProblemBody({ errors: "nope" }), {
		errorId: null,
		detail: null,
		fields: [],
	});
	// Field entries are dropped unless both parts are strings.
	assert.deepEqual(
		parseProblemBody({
			errors: [null, { field: 1, message: "x" }, { field: "a", message: "b" }],
		}).fields,
		[{ field: "a", message: "b" }],
	);
});

function problemClient(status: number, body: BodyInit | null) {
	return createHttpClient({
		name: "Test",
		baseUrl: () => "https://example.test",
		token: () => "test-token",
		fetch: async () => new Response(body, { status }),
	});
}

test("a service failure carries the parsed problem body, never the raw one", async () => {
	await assert.rejects(
		problemClient(
			422,
			JSON.stringify({
				errorId: "corr-1",
				detail: "Mailbox is full",
				errors: [{ field: "email", message: "Already subscribed" }],
			}),
		).empty("/test"),
		(error: unknown) => {
			assert.ok(error instanceof ServiceError);
			assert.equal(error.name, "ServiceError");
			assert.equal(error.status, 422);
			assert.equal(error.code, "validation");
			assert.equal(error.errorId, "corr-1");
			assert.equal(error.detail, "Mailbox is full");
			assert.deepEqual(error.fields, [
				{ field: "email", message: "Already subscribed" },
			]);
			assert.equal(error.message, "Test request failed (422)");
			return true;
		},
	);
});

test("malformed and empty problem bodies degrade to the empty problem", async () => {
	await assert.rejects(
		problemClient(500, "<html>proxy blew up</html>").empty("/test"),
		(error: unknown) => {
			assert.ok(error instanceof ServiceError);
			assert.equal(error.code, "internal");
			assert.equal(error.errorId, null);
			assert.equal(error.detail, null);
			assert.deepEqual(error.fields, []);
			assert.ok(!error.message.includes("proxy blew up"));
			return true;
		},
	);
	await assert.rejects(
		problemClient(503, null).empty("/test"),
		(error: unknown) => {
			assert.ok(error instanceof ServiceError);
			assert.equal(error.code, "unavailable");
			assert.deepEqual(error.fields, []);
			return true;
		},
	);
});

test("the error code is derived from status and problem-body shape", () => {
	const table: [number, boolean, ErrorCode][] = [
		[401, false, "unauthorized"],
		[403, false, "forbidden"],
		[404, false, "not-found"],
		[409, false, "conflict"],
		[400, false, "validation"],
		[422, false, "validation"],
		[422, true, "validation"],
		[429, false, "unavailable"],
		[502, false, "unavailable"],
		[503, false, "unavailable"],
		[504, false, "unavailable"],
		[500, false, "internal"],
		// Field errors never upgrade or downgrade the 5xx verdict.
		[500, true, "internal"],
		// An otherwise ambiguous 4xx is settled by the body's shape.
		[418, true, "validation"],
		[418, false, "internal"],
	];
	for (const [status, hasFieldErrors, code] of table)
		assert.equal(deriveErrorCode(status, hasFieldErrors), code, `${status}`);
});

test("constraint violations map to conflict and missing outcomes", () => {
	// A raw PostgresError and a drizzle wrapper around one, faked structurally.
	assert.equal(constraintViolation({ code: "23505" }), "conflict");
	assert.equal(
		constraintViolation({ message: "drizzle", cause: { code: "23505" } }),
		"conflict",
	);
	assert.equal(constraintViolation({ code: "23503" }), "not-found");
	assert.equal(
		constraintViolation({ cause: { cause: { code: "23503" } } }),
		"not-found",
	);
	assert.equal(constraintViolation({ code: "23502" }), null);
	assert.equal(constraintViolation({ code: "ECONNREFUSED" }), null);
	assert.equal(constraintViolation(new Error("boom")), null);
	assert.equal(constraintViolation(null), null);
	// An infinite cause chain terminates without classifying.
	assert.equal(constraintViolation(circularCause()), null);

	const unique = toAppError({ cause: { code: "23505" } });
	assert.ok(unique instanceof AppError);
	assert.equal(unique.code, "conflict");
	const foreignKey = toAppError({ code: "23503" });
	assert.equal(foreignKey.code, "not-found");
	// The driver message never leaks into the typed message.
	assert.ok(!unique.message.includes("duplicate key"));
});

function circularCause(): Record<string, unknown> {
	const failure: Record<string, unknown> = {};
	failure.cause = failure;
	return failure;
}

test("schema failures become validation verdicts with their field errors", () => {
	const failure = toAppError({
		issues: [
			{ path: ["contact", "email"], message: "Invalid email" },
			{ path: [], message: "Required" },
			{ path: ["name"], message: 5 },
		],
	});
	assert.equal(failure.code, "validation");
	assert.deepEqual(failure.fields, [
		{ field: "contact.email", message: "Invalid email" },
		{ field: "", message: "Required" },
	]);
});

test("typed errors pass through boundaries untouched and unknowns stay internal", async () => {
	const typed = new AppError("forbidden", "Only draft campaigns can be sent");
	assert.equal(toAppError(typed), typed);
	assert.equal(errorCode(typed), "forbidden");
	assert.equal(isAppError(typed), true);

	const unknown = await mapErrors(() => {
		throw new TypeError("kaboom");
	}).then(
		() => null,
		(error: unknown) => error,
	);
	assert.ok(unknown instanceof AppError);
	assert.equal(unknown.code, "internal");
	assert.equal(unknown.message, "Unexpected error");
	assert.equal(errorCode("a string"), "internal");

	// The create verdict maps to internal: an INSERT that returned no row is a
	// broken invariant, not a caller mistake.
	const notCreated = recordNotCreatedError();
	assert.equal(notCreated.code, "internal");
	assert.equal(notCreated.message, "Record was not created");
});

test("the repository boundary maps driver errors and keeps typed verdicts", async () => {
	const typed = new AppError(
		"not-found",
		"Record not found or no longer editable",
	);
	const store = guardRepository({
		duplicate() {
			return Promise.reject({ message: "drizzle", cause: { code: "23505" } });
		},
		missing() {
			throw typed;
		},
		ok() {
			return Promise.resolve(7);
		},
	});
	await assert.rejects(store.duplicate(), (error: unknown) => {
		assert.ok(isAppError(error));
		assert.equal(error.code, "conflict");
		return true;
	});
	await assert.rejects(store.missing(), (error: unknown) => error === typed);
	assert.equal(await store.ok(), 7);
});

test("update-miss verdicts keep their messages and gain model codes", () => {
	const stale = "2026-01-01T00:00:00.000Z";
	const current = "2026-01-02T00:00:00.000Z";

	const missing = updateMissError("jublawoma.table", null, stale);
	assert.equal(missing.name, "Error");
	assert.match(missing.message, /no longer editable/);
	assert.equal(errorCode(missing), "not-found");

	const skippedByGuard = updateMissError(
		"jublawoma.table",
		{ updatedAt: stale },
		stale,
	);
	assert.equal(skippedByGuard.name, "Error");
	assert.match(skippedByGuard.message, /no longer editable/);
	assert.equal(errorCode(skippedByGuard), "forbidden");

	const wrongIdentity = updateMissError(
		"jublawoma.table",
		{ updatedAt: stale },
		stale,
		false,
	);
	assert.ok(wrongIdentity instanceof RecordKeyMismatchError);
	assert.equal(errorCode(wrongIdentity), "validation");

	const staleWrite = updateMissError(
		"jublawoma.table",
		{ updatedAt: current },
		stale,
	);
	assert.ok(staleWrite instanceof ConcurrentUpdateError);
	assert.equal(errorCode(staleWrite), "conflict");
	// The flattened message form is still the conflict channel.
	assert.ok(isConcurrentUpdateError(new Error(staleWrite.message)));
	assert.equal(isConcurrentUpdateError(missing), false);
});
