import { emailMessage } from "@oliumbi/queue/email";
import type { ReservationInput } from "./forms";
import type { ReservableVariant } from "./reservation.types";
export function reservationEmails(
	sender: string,
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
		emailMessage("zelglihof", sender, sender, "Neue Reservation", details),
	];
	if (input.email)
		messages.push(
			emailMessage(
				"zelglihof",
				sender,
				input.email,
				"Deine Reservation beim Zelglihof",
				details,
			),
		);
	return messages;
}
