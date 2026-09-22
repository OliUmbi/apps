import {
	emailSchema,
	limits,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const inquirySchema = z.object({
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema,
	date: z.union([z.literal(""), z.iso.date()]),
	location: textSchema,
	guests: z.number().int().positive().max(10_000),
	note: textSchema,
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const reviewSchema = z.strictObject({
	stars: z.number().int().min(1).max(5),
	name: nameSchema,
	description: z.string().trim().min(5).max(limits.text),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
