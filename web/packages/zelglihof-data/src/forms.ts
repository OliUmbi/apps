import {
	emailSchema,
	idSchema,
	nameSchema,
	optionalEmailSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";
export const contactSchema = z.object({
	name: nameSchema,
	email: optionalEmailSchema,
	phone: phoneSchema,
	subject: z.enum(["hofladen", "reservation", "hof", "other"]),
	message: textSchema.min(10),
});
export type ContactInput = z.infer<typeof contactSchema>;
export const reservationSchema = z.object({
	productId: idSchema,
	variantId: idSchema,
	name: nameSchema,
	email: optionalEmailSchema,
	phone: phoneSchema,
	quantity: z.number().int().positive().max(100),
	note: textSchema,
});
export type ReservationInput = z.infer<typeof reservationSchema>;
export const newsletterSignupSchema = z.object({ email: emailSchema });
export const newsletterTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
