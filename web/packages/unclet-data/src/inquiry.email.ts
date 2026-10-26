import { m } from "@oliumbi/i18n/messages";
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
			m.unclet_inquiry_email_admin_subject(),
			details,
			input.email || undefined,
		),
		emailMessage(
			"unclet",
			requestsEmail,
			input.email,
			m.unclet_inquiry_email_customer_subject(),
			m.unclet_inquiry_email_customer_body({ reference }),
			requestsEmail,
		),
	];
}
