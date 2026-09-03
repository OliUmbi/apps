import { z } from "zod";

export const newsletterLocaleSchema = z.enum(["de-CH", "en"]);

export const newsletterSignupSchema = z.object({
	email: z.email().max(320),
	consent: z.literal(true, { error: "Die Einwilligung ist erforderlich." }),
});

export const newsletterTokenSchema = z.string().min(32).max(256);

export type NewsletterSignupInput = z.infer<typeof newsletterSignupSchema>;
