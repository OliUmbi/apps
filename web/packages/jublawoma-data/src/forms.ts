import {
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

// Quantities stay decimal strings end to end; float64 must never touch them (D2).
export const decimalSchema = z
	.string()
	.trim()
	.regex(/^\d+(\.\d+)?$/)
	.refine((value) => !/^0*(\.0*)?$/.test(value), "quantity must be positive");

export const commitmentSchema = z.strictObject({
	submissionId: idSchema,
	donationId: idSchema,
	itemId: idSchema,
	name: nameSchema,
	phone: phoneSchema,
	quantity: decimalSchema,
	note: textSchema,
	website: honeypotSchema,
});
export type CommitmentInput = z.infer<typeof commitmentSchema>;
