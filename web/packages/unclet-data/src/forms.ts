import {
	emailSchema,
	idSchema,
	limits,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

// Honeypot (X-04): `website` is a field humans never see and never fill. The
// form renders it hidden; a filled value marks a scripted submit and the
// service drops the fill silently. Optional on purpose: a request without the
// field still parses like a human's fill.
export const honeypotSchema = z.string().max(limits.text).optional();

/*
 * Public submission contracts: one strict Zod schema per public form, shared by
 * client and server. The types are named for the submission workflow so they
 * never read like the studio record inputs in content/*.
 */

// Local calendar day as "yyyy-mm-dd": the shared boundary for the event-date
// refine and the `min` attribute the site renders on the date input.
export function todayDateInput(): string {
	return localDateInput(new Date());
}

function localDateInput(date: Date): string {
	const pad = (part: number) => String(part).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// An event date is empty or a day that has not passed yet. The boundary is read
// per parse (not per module load), so a long-lived server cannot freeze it (U-10).
export function isFutureOrEmptyDate(value: string): boolean {
	return value === "" || value >= todayDateInput();
}

export const inquirySchema = z.strictObject({
	submissionId: idSchema,
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema,
	date: z.union([z.literal(""), z.iso.date()]).refine(isFutureOrEmptyDate),
	location: textSchema,
	guests: z.number().int().positive().max(10_000),
	note: textSchema,
	website: honeypotSchema,
});
export type InquirySubmissionInput = z.infer<typeof inquirySchema>;

export const reviewSchema = z.strictObject({
	// Every public form fill carries one submission id (D1); reviews are not deduplicated yet.
	submissionId: idSchema,
	stars: z.number().int().min(1).max(5),
	name: nameSchema,
	description: z.string().trim().min(5).max(limits.text),
	website: honeypotSchema,
});
export type ReviewSubmissionInput = z.infer<typeof reviewSchema>;
