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
export type InquirySubject = (typeof inquirySubjectValues)[number];

// Public submission contracts: one strict Zod schema per public form, shared by
// client and server.
export const contactSchema = z.strictObject({
	submissionId: idSchema,
	name: nameSchema,
	email: optionalEmailSchema,
	phone: phoneSchema,
	subject: z.enum(inquirySubjectValues),
	message: textSchema.min(10),
});
export type ContactInput = z.infer<typeof contactSchema>;
export const reservationSchema = z.strictObject({
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
export const newsletterSignupSchema = z.strictObject({ email: emailSchema });
export const newsletterTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
