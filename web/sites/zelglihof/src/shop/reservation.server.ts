import { randomUUID } from "node:crypto";
import {
	createEmailMessage,
	type EmailMessage,
	type OutgoingMessage,
} from "@oliumbi/messaging";
import { dispatchOutgoingMessages } from "../server/messaging.server";
import {
	insertReservationIfAvailable,
	type ReservableVariant,
} from "./reservation.repository";
import type { ReservationInput } from "./reservation.schema";

export type ReservationResult =
	| { outcome: "reserved"; reference: string }
	| { outcome: "unavailable" };

export async function reserveProduct(
	input: ReservationInput,
): Promise<ReservationResult> {
	const id = randomUUID();
	const now = new Date();
	const reference = id.slice(0, 8).toUpperCase();
	const reserved = await insertReservationIfAvailable(
		id,
		input,
		now,
		(variant) => reservationNotifications(input, variant, id, reference, now),
	);
	if (reserved) void dispatchOutgoingMessages().catch(reportDispatchFailure);
	return reserved
		? { outcome: "reserved", reference }
		: { outcome: "unavailable" };
}

function reportDispatchFailure(error: unknown) {
	console.error("Reservation notification dispatch failed", error);
}

function reservationNotifications(
	input: ReservationInput,
	variant: ReservableVariant,
	id: string,
	reference: string,
	now: Date,
): OutgoingMessage[] {
	const notifications = [ownerNotification(input, variant, id, reference)];
	if (input.email) {
		notifications.push(
			customerNotification(input, variant, id, reference, input.email),
		);
	}
	return notifications.map((notification) =>
		createEmailMessage(notification, now),
	);
}

function ownerNotification(
	input: ReservationInput,
	variant: ReservableVariant,
	id: string,
	reference: string,
): EmailMessage {
	const contact = [input.email, input.phone].filter(Boolean).join(" · ");
	const lines = [
		`Neue Reservation ${reference}`,
		`${input.name} (${contact})`,
		`${input.quantity} × ${variant.variantName}`,
		variant.productName,
		input.note ? `Notiz: ${input.note}` : "",
	].filter(Boolean);
	return {
		recipient: process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
		subject: `Neue Reservation ${reference} · ${variant.productName}`,
		text: lines.join("\n"),
		html: `<h1>Neue Reservation ${reference}</h1><p><strong>${escapeHtml(input.name)}</strong><br>${escapeHtml(contact)}</p><p>${input.quantity} × ${escapeHtml(variant.variantName)}<br>${escapeHtml(variant.productName)}</p>${input.note ? `<p><strong>Notiz</strong><br>${escapeHtml(input.note)}</p>` : ""}`,
		correlationKey: `zelglihof-reservation:${id}`,
	};
}

function customerNotification(
	input: ReservationInput,
	variant: ReservableVariant,
	id: string,
	reference: string,
	recipient: string,
): EmailMessage {
	return {
		recipient,
		subject: `Deine Reservation beim Zelglihof · ${reference}`,
		text: `Danke ${input.name}. Wir haben deine Reservation für ${input.quantity} × ${variant.variantName} erhalten. Referenz: ${reference}. Wir melden uns mit den Abholdetails.`,
		html: `<h1>Danke für deine Reservation</h1><p>Hallo ${escapeHtml(input.name)}</p><p>Wir haben <strong>${input.quantity} × ${escapeHtml(variant.variantName)}</strong> für dich vorgemerkt.</p><p>Deine Referenz: <strong>${reference}</strong></p><p>Wir melden uns mit den Abholdetails.<br>Zelglihof Mägenwil</p>`,
		correlationKey: `zelglihof-reservation:${id}`,
	};
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
