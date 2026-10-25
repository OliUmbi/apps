import {
	emailSchema,
	idSchema,
	limits,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

/*
 * Public submission contracts: one strict Zod schema per public form, shared by
 * client and server. The types are named for the submission workflow so they
 * never read like the studio record inputs in content/*.
 */
export const inquirySchema = z.strictObject({
	submissionId: idSchema,
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema,
	date: z.union([z.literal(""), z.iso.date()]),
	location: textSchema,
	guests: z.number().int().positive().max(10_000),
	note: textSchema,
});
export type InquirySubmissionInput = z.infer<typeof inquirySchema>;

export const reviewSchema = z.strictObject({
	// Every public form fill carries one submission id (D1); reviews are not deduplicated yet.
	submissionId: idSchema,
	stars: z.number().int().min(1).max(5),
	name: nameSchema,
	description: z.string().trim().min(5).max(limits.text),
});
export type ReviewSubmissionInput = z.infer<typeof reviewSchema>;
