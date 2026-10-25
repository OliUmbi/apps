import {
	idSchema,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

// Quantities stay decimal strings end to end; float64 must never touch them (D2).
export const decimalSchema = z
	.string()
	.trim()
	.regex(/^\d+(\.\d+)?$/)
	.refine((value) => !/^0*(\.0*)?$/.test(value), "quantity must be positive");

export const commitmentSchema = z.object({
	submissionId: idSchema,
	donationId: idSchema,
	itemId: idSchema,
	name: nameSchema,
	phone: phoneSchema,
	quantity: decimalSchema,
	note: textSchema,
});
export type CommitmentInput = z.infer<typeof commitmentSchema>;
