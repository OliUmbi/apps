import {
	emailSchema,
	idSchema,
	limits,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const inquirySchema = z.object({
	submissionId: idSchema,
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
	// Every public form fill carries one submission id (D1); reviews are not deduplicated yet.
	submissionId: idSchema,
	stars: z.number().int().min(1).max(5),
	name: nameSchema,
	description: z.string().trim().min(5).max(limits.text),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
