import { randomUUID } from "node:crypto";
import { createEmailMessage, type EmailMessage } from "@oliumbi/messaging";
import { dispatchOutgoingMessages } from "../server/messaging.server";
import { insertContactInquiryWithNotification } from "./contact.repository";
import type { ContactInput } from "./contact.schema";

const subjects = {
	hofladen: "Hofladen",
	reservation: "Reservation",
	hof: "Frage zum Hof",
	other: "Andere Frage",
} as const;
function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

export async function saveContactInquiry(input: ContactInput) {
	const id = randomUUID();
	const now = new Date();
	const reference = createReference(id);
	await insertContactInquiryWithNotification(
		id,
		input,
		subjects[input.subject],
		createEmailMessage(ownerNotification(input, id, reference), now),
		now,
	);
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
	return { outcome: "sent" as const, reference };
}

function reportDispatchFailure(error: unknown) {
	console.error("Contact notification dispatch failed", error);
}

function createReference(id: string) {
	return id.slice(0, 8).toUpperCase();
}

function ownerNotification(
	input: ContactInput,
	id: string,
	reference: string,
): EmailMessage {
	const subject = subjects[input.subject];
	const contact = [input.email, input.phone].filter(Boolean).join(" · ");
	return {
		recipient: process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
		subject: `Neue Hofanfrage · ${subject}`,
		text: `${input.name}\n${contact}\n\n${input.message}\n\nReferenz: ${reference}`,
		html: `<h1>Neue Hofanfrage</h1><p><strong>${escapeHtml(subject)}</strong></p><p>${escapeHtml(input.name)}<br>${escapeHtml(contact)}</p><p>${escapeHtml(input.message).replaceAll("\n", "<br>")}</p><p>Referenz: ${reference}</p>`,
		correlationKey: `zelglihof-contact:${id}`,
	};
}
