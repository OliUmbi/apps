import {
	emailSchema,
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
