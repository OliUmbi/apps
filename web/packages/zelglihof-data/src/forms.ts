import {
	emailSchema,
	idSchema,
	nameSchema,
	optionalEmailSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

// The contact category vocabulary; the database domain (V010) mirrors it.
export const inquirySubjectValues = [
	"hofladen",
	"reservation",
	"hof",
	"other",
] as const;

export const contactSchema = z.object({
	submissionId: idSchema,
	name: nameSchema,
	email: optionalEmailSchema,
	phone: phoneSchema,
	subject: z.enum(inquirySubjectValues),
	message: textSchema.min(10),
});
export type ContactInput = z.infer<typeof contactSchema>;
export const reservationSchema = z.object({
	submissionId: idSchema,
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
