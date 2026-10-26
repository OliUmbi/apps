import {
	emailSchema,
	idSchema,
	limits,
	nameSchema,
	optionalEmailSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

// Honeypot (X-04): `website` is a field humans never see and never fill. The
// forms render it hidden; a filled value marks a scripted submit and the
// service drops the fill silently. Optional on purpose: a request without the
// field still parses like a human's fill.
export const honeypotSchema = z.string().max(limits.text).optional();

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
	website: honeypotSchema,
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
	website: honeypotSchema,
});
export type ReservationInput = z.infer<typeof reservationSchema>;
export const newsletterSignupSchema = z.strictObject({
	email: emailSchema,
	website: honeypotSchema,
});
export const newsletterTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
