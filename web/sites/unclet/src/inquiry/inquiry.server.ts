import { randomUUID } from "node:crypto";
import { createEmailMessage, type EmailMessage } from "@oliumbi/messaging";
import { dispatchOutgoingMessages } from "../server/messaging.server";
import { insertInquiryWithNotifications } from "./inquiry.repository";
import type { InquiryInput } from "./inquiry.schema";

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function details(input: InquiryInput, reference: string) {
	return [
		`Name: ${input.name}`,
		`E-Mail: ${input.email || "–"}`,
		`Telefon: ${input.phone || "–"}`,
		`Datum: ${input.date || "noch offen"}`,
		`Ort: ${input.location}`,
		`Gäste: ${input.guests}`,
		"",
		input.note || "Keine weiteren Angaben.",
		"",
		`Referenz: ${reference}`,
	].join("\n");
}

export async function saveInquiry(input: InquiryInput) {
	const id = randomUUID();
	const now = new Date();
	const reference = id.slice(0, 8).toUpperCase();
	await insertInquiryWithNotifications(
		id,
		input,
		inquiryNotifications(input, id, reference).map((notification) =>
			createEmailMessage(notification, now),
		),
		now,
	);
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
	return { outcome: "sent" as const, reference };
}

function reportDispatchFailure(error: unknown) {
	console.error("Inquiry notification dispatch failed", error);
}

function inquiryNotifications(
	input: InquiryInput,
	id: string,
	reference: string,
): EmailMessage[] {
	const notifications = [ownerNotification(input, id, reference)];
	if (input.email)
		notifications.push(customerNotification(input, id, reference));
	return notifications;
}

function ownerNotification(
	input: InquiryInput,
	id: string,
	reference: string,
): EmailMessage {
	const text = details(input, reference);
	return {
		recipient: process.env.UNCLET_OWNER_EMAIL ?? "info@uncle-t.ch",
		subject: `Neue Anfrage von ${input.name}`,
		text,
		html: `<h1>Neue Anfrage</h1><p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`,
		correlationKey: `unclet-inquiry:${id}:owner`,
	};
}

function customerNotification(
	input: InquiryInput & { email: string },
	id: string,
	reference: string,
): EmailMessage {
	return {
		recipient: input.email,
		subject: "Deine Anfrage bei Uncle-T",
		text: `Hallo ${input.name}\n\nDanke für deine Anfrage. Ich melde mich persönlich bei dir, um die Details zu besprechen.\n\nReferenz: ${reference}\n\nThomas · Uncle-T`,
		html: `<p>Hallo ${escapeHtml(input.name)}</p><p>Danke für deine Anfrage. Ich melde mich persönlich bei dir, um die Details zu besprechen.</p><p>Referenz: ${reference}</p><p>Thomas · Uncle-T</p>`,
		correlationKey: `unclet-inquiry:${id}:customer`,
	};
}
