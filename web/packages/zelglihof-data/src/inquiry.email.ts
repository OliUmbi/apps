import { emailMessage } from "@oliumbi/queue/email";
import type { ContactInput } from "./forms";

export function inquiryNotification(
	input: ContactInput,
	reference: string,
	sender: string,
) {
	const text = [
		input.name,
		input.email,
		input.phone,
		input.subject,
		input.message,
		reference,
	].join("\n");
	return emailMessage("zelglihof", sender, sender, "Neue Hofanfrage", text);
}
