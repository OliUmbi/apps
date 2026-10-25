import {
	type ReservationInput,
	reservationSchema,
} from "@oliumbi/zelglihof-data/forms";
import { createReservationService } from "@oliumbi/zelglihof-data/reservation.service";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export { type ReservationInput, reservationSchema };

export const createReservation = createServerFn({ method: "POST" })
	.validator(reservationSchema)
	.handler(({ data }) => reserveProduct(data));

function reserveProduct(input: ReservationInput) {
	return createReservationService(
		database,
		process.env.ZELGLIHOF_REQUESTS_EMAIL ?? "hof@zelglihof.ch",
	).reserve(input);
}
