import { createServerFn } from "@tanstack/react-start";
import { reservationSchema } from "./reservation.schema";
import { reserveProduct } from "./reservation.server";

export const createReservation = createServerFn({ method: "POST" })
	.validator(reservationSchema)
	.handler(({ data }) => reserveProduct(data));
