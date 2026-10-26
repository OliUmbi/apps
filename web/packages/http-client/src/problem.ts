import type { FieldError } from "@oliumbi/contracts";

// The safe, parsed view of a Java service's problem body: an errorId (the
// correlation id), detail (human text), and - on validation failures - a list
// of field errors. The raw body itself is never kept.
export interface ServiceProblem {
	errorId: string | null;
	detail: string | null;
	fields: FieldError[];
}

export const emptyProblem: ServiceProblem = {
	errorId: null,
	detail: null,
	fields: [],
};

function fieldError(entry: unknown): FieldError[] {
	if (typeof entry !== "object" || entry === null) return [];
	const { field, message } = entry as Record<string, unknown>;
	if (typeof field !== "string" || typeof message !== "string") return [];
	return [{ field, message }];
}

// Parses a problem body defensively: malformed or hostile payloads degrade to
// the empty problem instead of leaking shape, text, or stacks to the caller.
export function parseProblemBody(input: unknown): ServiceProblem {
	if (typeof input !== "object" || input === null || Array.isArray(input))
		return { ...emptyProblem };
	const body = input as Record<string, unknown>;
	const errorId =
		typeof body.errorId === "string" && body.errorId.trim() !== ""
			? body.errorId.trim()
			: null;
	const detail =
		typeof body.detail === "string" && body.detail.trim() !== ""
			? body.detail.trim()
			: null;
	const fields = Array.isArray(body.errors)
		? body.errors.flatMap(fieldError)
		: [];
	return { errorId, detail, fields };
}
