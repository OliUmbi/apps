// One typed-error model for every package boundary. A raw Error, ZodError, or
// database driver error must never cross a package or server-function boundary:
// callers get an AppError whose code answers their only real questions - sign in
// (unauthorized), retry (unavailable), conflict, not-found, or validation.

export type ErrorCode =
	| "unauthorized"
	| "forbidden"
	| "not-found"
	| "conflict"
	| "validation"
	| "unavailable"
	| "internal";

export interface FieldError {
	field: string;
	message: string;
}

export interface AppErrorOptions {
	/** correlation id from the failing service, when there is one */
	errorId?: string | null;
	/** safe, human-readable detail preserved from the failing service */
	detail?: string | null;
	fields?: readonly FieldError[];
	cause?: unknown;
}

// `name` deliberately stays "Error": the server-function boundary keeps only
// Error.message and rebuilds plain errors, so message and code are the channels
// that survive - a class-specific name would only differ inside one process.
// Named subclasses that want a name set it themselves.
export class AppError extends Error {
	readonly code: ErrorCode;
	readonly errorId: string | null;
	readonly detail: string | null;
	readonly fields: readonly FieldError[];

	constructor(code: ErrorCode, message: string, options: AppErrorOptions = {}) {
		super(message, { cause: options.cause });
		this.code = code;
		this.errorId = options.errorId ?? null;
		this.detail = options.detail ?? null;
		this.fields = options.fields ?? [];
	}
}

export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

// The code of a failure as a caller sees it after any boundary: typed errors
// carry their code, everything else is an unclassified internal failure.
export function errorCode(error: unknown): ErrorCode {
	return isAppError(error) ? error.code : "internal";
}

// Status first; the problem body's shape only settles the statuses that stay
// ambiguous without it. A body that proves field errors is always validation,
// except where the status already gives a more specific verdict.
export function deriveErrorCode(
	status: number,
	hasFieldErrors = false,
): ErrorCode {
	if (status === 401) return "unauthorized";
	if (status === 403) return "forbidden";
	if (status === 404) return "not-found";
	if (status === 409) return "conflict";
	if (status === 429 || status === 502 || status === 503 || status === 504)
		return "unavailable";
	if (status >= 500) return "internal";
	if (status === 400 || status === 422 || hasFieldErrors) return "validation";
	return "internal";
}

// The two PostgreSQL constraint classes with caller-visible meaning, read from
// the SQLSTATE on the driver error or on a wrapper's `cause` chain (drizzle
// wraps PostgresError in its own query error). Unique violation is a conflict;
// foreign-key violation means a referenced record is missing. Structurally
// detected on purpose: no driver type is needed to classify one.
export function constraintViolation(
	error: unknown,
): "conflict" | "not-found" | null {
	let failure: unknown = error;
	for (let depth = 0; depth < 8; depth += 1) {
		if (typeof failure !== "object" || failure === null) return null;
		const code = (failure as { code?: unknown }).code;
		if (code === "23505") return "conflict";
		if (code === "23503") return "not-found";
		failure = (failure as { cause?: unknown }).cause;
	}
	return null;
}

// A ZodError-shaped validation failure, read structurally: `issues` entries
// carry only the field path and the message out of the failure.
function zodFieldErrors(error: unknown): FieldError[] | null {
	if (typeof error !== "object" || error === null) return null;
	const issues = (error as { issues?: unknown }).issues;
	if (!Array.isArray(issues)) return null;
	const fields: FieldError[] = [];
	for (const issue of issues) {
		if (typeof issue !== "object" || issue === null) continue;
		const { path, message } = issue as { path?: unknown; message?: unknown };
		if (typeof message !== "string") continue;
		fields.push({
			field: Array.isArray(path) ? path.map(String).join(".") : "",
			message,
		});
	}
	return fields;
}

// Canonical mapping for anything thrown across a boundary. Typed errors pass
// through untouched; schema failures become validation, constraint violations
// become conflict/not-found, and everything else becomes a classified internal
// failure with the original kept as `cause` for logs, never as the message.
export function toAppError(error: unknown): AppError {
	if (error instanceof AppError) return error;
	const fields = zodFieldErrors(error);
	if (fields)
		return new AppError("validation", "Request failed validation", {
			fields,
			cause: error,
		});
	const violation = constraintViolation(error);
	if (violation === "conflict")
		return new AppError(
			"conflict",
			"Record conflicts with an existing record",
			{
				cause: error,
			},
		);
	if (violation === "not-found")
		return new AppError("not-found", "A related record is missing", {
			cause: error,
		});
	return new AppError("internal", "Unexpected error", { cause: error });
}

// Runs one call as a boundary: whatever it throws leaves typed. A thrown value
// is always an AppError afterwards, so callers can branch on `code` alone.
export async function mapErrors<T>(run: () => T | Promise<T>): Promise<T> {
	try {
		return await run();
	} catch (error) {
		throw toAppError(error);
	}
}

// The create verdict of a repository: an INSERT ... RETURNING that produced no
// row is a broken invariant, not a caller mistake and not a state the caller
// can act on, so it maps to the model as internal.
export const recordNotCreatedMessage = "Record was not created";

export function recordNotCreatedError(): AppError {
	return new AppError("internal", recordNotCreatedMessage);
}

// Wraps every method of a repository so raw driver errors never cross the
// repository boundary: 23505 becomes a conflict, 23503 a missing-class
// outcome, anything else a classified internal failure. Typed errors raised
// inside the methods (missing / forbidden / conflict / not-created verdicts)
// pass through unchanged, instance and message alike.
export function guardRepository<T extends object>(repository: T): T {
	const guarded: Record<string, unknown> = {};
	for (const [name, value] of Object.entries(repository))
		guarded[name] =
			typeof value === "function"
				? (...args: unknown[]) =>
						mapErrors(() =>
							(value as (...args: unknown[]) => unknown).apply(guarded, args),
						)
				: value;
	return guarded as T;
}
