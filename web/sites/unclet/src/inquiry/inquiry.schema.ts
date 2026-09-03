import { z } from "zod";

export const inquirySchema = z
	.object({
		name: z.string().trim().min(2).max(120),
		email: z.union([z.literal(""), z.email().max(320)]),
		phone: z.string().trim().max(40),
		date: z.union([z.literal(""), z.iso.date()]),
		location: z.string().trim().min(2).max(160),
		guests: z.number().int().min(1).max(10_000),
		note: z.string().trim().max(3_000),
	})
	.refine((value) => value.email || value.phone, {
		message: "Bitte E-Mail oder Telefonnummer angeben.",
		path: ["email"],
	});

export type InquiryInput = z.infer<typeof inquirySchema>;
