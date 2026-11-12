import { m } from "@oliumbi/i18n/messages";

interface Issue {
	code: string;
	origin?: string;
	received?: string;
}

/**
 * Translates zod issue codes at the Studio editor boundary. The schemas are
 * shared with the server and keep their English diagnostics; the editor never
 * shows them verbatim.
 */
export function studioValidationMessage(issue: Issue): string {
	switch (issue.code) {
		case "invalid_type":
			return issue.received === "undefined"
				? m.validation_required()
				: m.validation_invalid();
		case "too_small":
			return issue.origin === "string"
				? m.validation_too_short()
				: m.validation_range();
		case "too_big":
			return issue.origin === "string"
				? m.validation_too_long()
				: m.validation_range();
		case "custom":
			return m.validation_custom();
		default:
			return m.validation_invalid();
	}
}
