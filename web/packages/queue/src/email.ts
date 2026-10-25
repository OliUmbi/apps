import { createHash, randomUUID } from "node:crypto";
import type { QueuedEmail } from "./message";

export function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

export function emailMessage(
	site: string,
	sender: string,
	recipient: string,
	subject: string,
	text: string,
	replyTo?: string,
): QueuedEmail {
	return {
		id: randomUUID(),
		site,
		sender,
		recipient,
		replyTo: replyTo ?? null,
		subject,
		text,
		html: `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`,
	};
}

const REFERENCE_LENGTH = 12;

/**
 * Derived from the submission id, so a retry of the same submission reports the
 * same reference. Hashing keeps the reference from disclosing the idempotency
 * key and from being guessed from row order.
 */
export function referenceFor(submissionId: string) {
	return createHash("sha256")
		.update(submissionId)
		.digest("hex")
		.slice(0, REFERENCE_LENGTH)
		.toUpperCase();
}
