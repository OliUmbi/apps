import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type ReservationInput, reservationSchema } from "./forms";
import { reservationEmails } from "./reservation.email";
import { createReservationRepository } from "./reservation.repository";
import type { ReservationPlan, ReservationResult } from "./reservation.types";

// Pure decision point: a replayed submission reports the original outcome and writes nothing.
export function decideReservation(input: {
	replayed: boolean;
	available: boolean;
	stock: number | null;
	quantity: number;
}): ReservationPlan {
	if (input.replayed) return { outcome: "reserved", insert: false };
	if (
		!input.available ||
		(input.stock !== null && input.stock < input.quantity)
	)
		return { outcome: "unavailable", insert: false };
	return { outcome: "reserved", insert: true };
}

export function createReservationService(
	database: DatabasePool,
	requestsEmail: string,
) {
	return {
		async reserve(input: ReservationInput): Promise<ReservationResult> {
			const values = reservationSchema.parse(input);
			const reference = referenceFor(values.submissionId);
			const reserved: ReservationResult = { outcome: "reserved", reference };
			return database.transaction(async (transaction) => {
				const repository = createReservationRepository(transaction);
				// The variant lock serializes concurrent fills; after it, a retry
				// sees the original row and reports its outcome unchanged.
				const variant = await repository.lockVariant(values);
				const plan = decideReservation({
					replayed:
						(await repository.findBySubmissionId(values.submissionId)) !== null,
					available: variant?.available ?? false,
					stock: variant?.quantity ?? null,
					quantity: values.quantity,
				});
				if (plan.outcome !== "reserved") return { outcome: plan.outcome };
				// Insert before the stock decrement so a lost insert race (unique
				// submission index) leaves no second decrement and no second emails.
				const now = new Date();
				if (
					plan.insert &&
					variant &&
					(await repository.insert(randomUUID(), values, variant, now))
				) {
					await repository.decrementStock(
						values.variantId,
						values.quantity,
						now,
					);
					const queue = createQueueClient(transaction);
					for (const message of reservationEmails(
						requestsEmail,
						values,
						variant,
						reference,
					))
						await queue.enqueue(message);
				}
				return reserved;
			});
		},
	};
}
