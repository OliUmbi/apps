import { emailMessage } from "@oliumbi/queue/email";
import type { InquirySubmissionInput } from "./forms";

export function inquiryEmails(
	requestsEmail: string,
	input: InquirySubmissionInput,
	reference: string,
) {
	const details = [
		input.name,
		input.email,
		input.phone,
		input.date,
		input.location,
		String(input.guests),
		input.note,
		reference,
	].join("\n");
	return [
		emailMessage(
			"unclet",
			requestsEmail,
			requestsEmail,
			"Neue Anfrage",
			details,
			input.email || undefined,
		),
		emailMessage(
			"unclet",
			requestsEmail,
			input.email,
			"Deine Anfrage bei Uncle-T",
			`Danke für deine Anfrage. Wir melden uns persönlich bei dir. Referenz: ${reference}`,
			requestsEmail,
		),
	];
}
