import { AppError } from "@oliumbi/contracts";

// A key/values mismatch is a caller error, never a silent re-parenting: updates
// address one row by its key and never rewrite identity columns.
export class RecordKeyMismatchError extends AppError {
	readonly table: string;

	constructor(table: string) {
		super("validation", `Key does not match the identity columns of ${table}`);
		this.name = "RecordKeyMismatchError";
		this.table = table;
	}
}

// A stale update is a conflict, never a silent last-write-wins: update() carries
// the caller's expected updatedAt in the update statement itself, so concurrent
// saves cannot overwrite each other. The message is deliberately stable and
// table-free: it is the conflict contract across the studio server-function
// boundary, where only Error.message survives serialization.
export const concurrentUpdateMessage = "Record changed since it was loaded";

export class ConcurrentUpdateError extends AppError {
	readonly table: string;

	constructor(table: string) {
		super("conflict", concurrentUpdateMessage);
		this.name = "ConcurrentUpdateError";
		this.table = table;
	}
}

// Recognises the conflict as its typed class and as the plain message form the
// server-function boundary reduces errors to.
export function isConcurrentUpdateError(error: unknown): boolean {
	return error instanceof Error && error.message === concurrentUpdateMessage;
}

// The missing and skipped-by-guard verdicts share one deliberately vague
// message (never tell the caller which rows exist and are uneditable) and keep
// Error's plain name: the boundary flattens errors to new Error(message), so
// message and the typed code are what callers branch on, never the class name.
const notEditableMessage = "Record not found or no longer editable";

// Decides why a guarded update matched no row and returns the typed error for
// that reason: identity first (the key guard), then the stale token, then a row
// the statement was allowed to skip (e.g. a status guard). The decision is pure
// so its outcomes stay pinned by tests. The typed verdicts map to the shared
// model as missing (not-found), key mismatch (validation), stale token
// (conflict), and guard-skip (forbidden).
export function updateMissError(
	table: string,
	current: { updatedAt: string } | null,
	expectedUpdatedAt: string,
	identityMatches = true,
): Error {
	if (!current) return new AppError("not-found", notEditableMessage);
	if (!identityMatches) return new RecordKeyMismatchError(table);
	if (current.updatedAt !== expectedUpdatedAt)
		return new ConcurrentUpdateError(table);
	return new AppError("forbidden", notEditableMessage);
}
