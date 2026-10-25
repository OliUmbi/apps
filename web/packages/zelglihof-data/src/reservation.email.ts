import { emailMessage } from "@oliumbi/queue/email";
import type { ReservationInput } from "./forms";
import type { ReservableVariant } from "./reservation.types";

export function reservationEmails(
	requestsEmail: string,
	input: ReservationInput,
	variant: ReservableVariant,
	reference: string,
) {
	const details = [
		input.name,
		input.phone,
		input.email,
		variant.productName,
		variant.variantName,
		String(input.quantity),
		input.note,
		reference,
	].join("\n");
	const messages = [
		emailMessage(
			"zelglihof",
			requestsEmail,
			requestsEmail,
			"Neue Reservation",
			details,
			input.email || undefined,
		),
	];
	if (input.email)
		messages.push(
			emailMessage(
				"zelglihof",
				requestsEmail,
				input.email,
				"Deine Reservation beim Zelglihof",
				details,
				requestsEmail,
			),
		);
	return messages;
}
