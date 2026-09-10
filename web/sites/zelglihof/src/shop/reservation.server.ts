import type { ReservationInput } from "@oliumbi/zelglihof-data/contracts";
import { createReservationService } from "@oliumbi/zelglihof-data/reservation.service";
import { database } from "../server/database.server";
export function reserveProduct(input: ReservationInput) {
	return createReservationService(
		database,
		process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
	).reserve(input);
}
