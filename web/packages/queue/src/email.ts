import { randomUUID } from "node:crypto";
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
): QueuedEmail {
	return {
		id: randomUUID(),
		site,
		sender,
		recipient,
		subject,
		text,
		html: `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`,
	};
}

const REFERENCE_LENGTH = 8;

export function referenceFor(id: string) {
	return id.slice(0, REFERENCE_LENGTH).toUpperCase();
}
