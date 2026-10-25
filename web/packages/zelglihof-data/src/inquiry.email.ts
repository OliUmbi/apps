import { emailMessage } from "@oliumbi/queue/email";
import type { ContactInput } from "./forms";

export function inquiryNotification(
	input: ContactInput,
	reference: string,
	requestsEmail: string,
) {
	const text = [
		input.name,
		input.email,
		input.phone,
		input.subject,
		input.message,
		reference,
	].join("\n");
	return emailMessage(
		"zelglihof",
		requestsEmail,
		requestsEmail,
		"Neue Hofanfrage",
		text,
		input.email || undefined,
	);
}
