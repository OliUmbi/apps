/*
 * Typed submission contract for public forms. Field names, defaults and value
 * coercion are tied to the schema's input type, so renaming a domain field
 * breaks compilation instead of silently reading the wrong key (R20). Control
 * kinds are explicit; coercion derives from the kind, never from a name list.
 *
 * Validation issues keep their field path and map to a small reason vocabulary
 * which the shared message catalog translates per reason (`validation_*`).
 * Only `issue.path[0]` is used as the field key: nested paths (arrays, objects)
 * would collide there. All public forms are flat objects today; a nested schema
 * must revisit `submissionErrors` before it may use this contract.
 */

export type SubmissionFieldName<Input> = Extract<keyof Input, string>;

/*
 * "number" and "rating" payloads become JS numbers; "decimal-string" keeps its
 * decimal string payload end to end because float64 must never touch a
 * quantity (D2). "checkbox" payloads are booleans derived from presence in the
 * submitted form data; "file" passes the entry through unchanged.
 */
export type SubmissionFieldKind =
	| "text"
	| "email"
	| "tel"
	| "url"
	| "date"
	| "time"
	| "number"
	| "decimal-string"
	| "textarea"
	| "select"
	| "checkbox"
	| "rating"
	| "file";

interface SubmissionFieldBase<Input> {
	name: SubmissionFieldName<Input>;
	label: string;
	required?: boolean;
	placeholder?: string;
	autoComplete?: string;
	// Layout hook for the consuming site's field grid (the sites style these
	// classes themselves, e.g. `form-control-wrap` / `is-wide`).
	wide?: boolean;
}

export type SubmissionField<Input> = SubmissionFieldBase<Input> &
	(
		| {
				kind:
					| "text"
					| "email"
					| "tel"
					| "url"
					| "date"
					| "time"
					| "checkbox"
					| "file";
		  }
		| { kind: "number"; min?: number; max?: number; step?: number }
		| { kind: "decimal-string"; min?: number; max?: number; step?: number }
		| { kind: "rating"; max?: number }
		| { kind: "textarea"; rows?: number }
		| { kind: "select"; options: readonly { value: string; label: string }[] }
	);

export type SubmissionErrorReason =
	| "required"
	| "too_short"
	| "too_long"
	| "invalid"
	| "range"
	| "custom";

export type SubmissionFieldErrors<Input> = Partial<
	Record<SubmissionFieldName<Input>, SubmissionErrorReason>
>;

export interface SubmissionErrors<Input> {
	fields: SubmissionFieldErrors<Input>;
	// Issues without a top-level field path (e.g. unrecognized keys) keep their
	// reason here; the form-level banner renders it.
	form: SubmissionErrorReason | null;
}

/*
 * Structural view of a Zod issue: only the parts the reason mapping reads. Kept
 * structural so the mapping is testable without importing a schema library.
 */
export interface SubmissionIssue {
	readonly code: string;
	readonly path: readonly PropertyKey[];
	readonly origin?: string;
}

/*
 * `values` are the coerced form values being validated: Zod issues do not carry
 * the offending value, and an empty field must read as `required` no matter
 * which check rejected it. Schemas must therefore not reject empty values for
 * fields they treat as optional.
 */
export function submissionErrors<Input>(
	issues: readonly SubmissionIssue[],
	values: Readonly<Record<string, unknown>>,
): SubmissionErrors<Input> {
	const fields: SubmissionFieldErrors<Input> = {};
	let form: SubmissionErrorReason | null = null;
	for (const issue of issues) {
		const key = issue.path[0];
		if (typeof key === "string") {
			const reason = isEmptyValue(values[key])
				? "required"
				: submissionErrorReason(issue);
			// First issue per field wins: it is the one the user must fix first.
			if (!(key in fields)) fields[key as SubmissionFieldName<Input>] = reason;
		} else if (form === null) {
			form = submissionErrorReason(issue);
		}
	}
	return { fields, form };
}

export function submissionErrorReason(
	issue: SubmissionIssue,
): SubmissionErrorReason {
	switch (issue.code) {
		case "too_small":
			return lengthBounded(issue) ? "too_short" : "range";
		case "too_big":
			return lengthBounded(issue) ? "too_long" : "range";
		case "not_multiple_of":
			return "range";
		case "custom":
			return "custom";
		default:
			return "invalid";
	}
}

function lengthBounded(issue: SubmissionIssue): boolean {
	return (
		issue.origin === "string" ||
		issue.origin === "array" ||
		issue.origin === "set" ||
		issue.origin === "map"
	);
}

function isEmptyValue(value: unknown): boolean {
	return (
		value === undefined ||
		value === null ||
		(typeof value === "string" && value.trim() === "")
	);
}

export function coerceSubmissionValues<Input>(
	form: FormData,
	fields: readonly SubmissionField<Input>[],
	defaults: Partial<Record<SubmissionFieldName<Input>, unknown>>,
): Record<string, unknown> {
	// Submitted values override defaults; defaults survive for fields the form
	// does not submit (hidden ids folded in per form fill).
	const values: Record<string, unknown> = {
		...defaults,
		...Object.fromEntries(form),
	};
	for (const field of fields) {
		values[field.name] = coerceSubmissionValue(
			field.kind,
			values[field.name],
			form.has(field.name),
		);
	}
	return values;
}

export function coerceSubmissionValue(
	kind: SubmissionFieldKind,
	value: unknown,
	submitted: boolean,
): unknown {
	switch (kind) {
		case "number":
		case "rating":
			return Number(value);
		case "checkbox":
			return submitted;
		default:
			return value;
	}
}
