import { z } from "zod";

const optionalEmail = z.union([
	z.literal(""),
	z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
]);

export const reservationSchema = z
	.object({
		productId: z.string().min(1).max(80),
		variantId: z.string().min(1).max(100),
		name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(120),
		email: optionalEmail,
		phone: z.string().trim().max(40),
		quantity: z.number().int().min(1).max(20),
		note: z.string().trim().max(1000),
	})
	.refine((value) => value.email.length > 0 || value.phone.length > 0, {
		message: "Bitte gib eine E-Mail-Adresse oder Telefonnummer ein.",
	});

export type ReservationInput = z.infer<typeof reservationSchema>;
