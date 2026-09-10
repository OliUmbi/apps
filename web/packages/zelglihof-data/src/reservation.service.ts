import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type ReservationInput, reservationSchema } from "./forms";
import { reservationEmails } from "./reservation.email";
import { createReservationRepository } from "./reservation.repository";
import type { ReservationResult } from "./reservation.types";

export function createReservationService(
	database: DatabasePool,
	sender: string,
) {
	return {
		async reserve(input: ReservationInput): Promise<ReservationResult> {
			const values = reservationSchema.parse(input);
			const id = randomUUID();
			const reference = referenceFor(id);
			return database.transaction(async (sql) => {
				const repository = createReservationRepository(sql);
				const variant = await repository.lockVariant(values);
				if (
					!variant?.available ||
					(variant.quantity !== null && variant.quantity < values.quantity)
				) {
					return { outcome: "unavailable" };
				}
				const now = new Date();
				await repository.decrementStock(values.variantId, values.quantity, now);
				await repository.insert(id, values, variant, now);
				const queue = createQueueClient(sql);
				for (const message of reservationEmails(
					sender,
					values,
					variant,
					reference,
				))
					await queue.enqueue(message);
				return { outcome: "reserved", reference };
			});
		},
	};
}
