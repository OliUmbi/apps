import { z } from "zod";

export const contactSchema = z
	.object({
		name: z.string().trim().min(2).max(120),
		email: z.union([z.literal(""), z.email()]),
		phone: z.string().trim().max(40),
		subject: z.enum(["hofladen", "reservation", "hof", "other"]),
		message: z.string().trim().min(10).max(3000),
	})
	.refine((value) => value.email.length > 0 || value.phone.length > 0, {
		message: "Bitte gib eine E-Mail-Adresse oder Telefonnummer ein.",
	});

export type ContactInput = z.infer<typeof contactSchema>;
