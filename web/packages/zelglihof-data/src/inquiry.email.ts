import { emailMessage } from "@oliumbi/queue/email";
import type { ContactInput } from "./forms";

const subjects: Record<ContactInput["subject"], string> = {
	hofladen: "Hofladen",
	reservation: "Reservation",
	hof: "Hof",
	other: "Allgemein",
};

export function inquiryNotification(
	input: ContactInput,
	reference: string,
	requestsEmail: string,
) {
	const text = [
		`Name: ${input.name}`,
		`E-Mail: ${input.email || "—"}`,
		`Telefon: ${input.phone}`,
		`Anliegen: ${subjects[input.subject]}`,
		`Nachricht:\n${input.message}`,
		`Referenz: ${reference}`,
	].join("\n\n");
	return emailMessage(
		"zelglihof",
		requestsEmail,
		requestsEmail,
		"Neue Hofanfrage",
		text,
		input.email || undefined,
	);
}
