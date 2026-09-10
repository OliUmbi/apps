import { emailMessage } from "@oliumbi/queue/email";
import type { NewsletterOptions } from "./newsletter.types";
export function confirmationEmail(
	options: NewsletterOptions,
	email: string,
	token: string,
) {
	const url = new URL(`/newsletter/confirm/${token}`, options.publicUrl).href;
	return emailMessage(
		"zelglihof",
		options.sender,
		email,
		"Newsletter bestätigen",
		`Bitte bestätige deine Anmeldung innerhalb von 48 Stunden:\n${url}\n\nFalls du dich nicht angemeldet hast, kannst du diese Nachricht ignorieren.`,
	);
}
export function welcomeEmail(
	options: NewsletterOptions,
	email: string,
	token: string,
) {
	const url = new URL(`/newsletter/unsubscribe/${token}`, options.publicUrl)
		.href;
	return emailMessage(
		"zelglihof",
		options.sender,
		email,
		"Willkommen beim Zelglihof",
		`Danke für deine Anmeldung.\n\nAbmelden: ${url}`,
	);
}
