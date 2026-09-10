import { emailMessage } from "@oliumbi/queue/email";
import type { InquiryInput } from "./forms";
export function inquiryEmails(
	sender: string,
	input: InquiryInput,
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
		emailMessage("unclet", sender, sender, "Neue Anfrage", details),
		emailMessage(
			"unclet",
			sender,
			input.email,
			"Deine Anfrage bei Uncle-T",
			`Danke für deine Anfrage. Wir melden uns persönlich bei dir. Referenz: ${reference}`,
		),
	];
}
