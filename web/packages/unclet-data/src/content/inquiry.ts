import { idSchema, statusSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	databaseDateSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const inquiryKeySchema = z.strictObject({
	id: idSchema,
});
export type InquiryKey = z.infer<typeof inquiryKeySchema>;

export const inquirySchema = z.object({
	id: idSchema,
	status: statusSchema,
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	eventOn: databaseDateSchema.nullable(),
	location: z.string().nullable(),
	guestCount: z.number().int().nonnegative().nullable(),
	note: z.string().nullable(),
	...auditColumns,
});
export type Inquiry = z.infer<typeof inquirySchema>;

export const inquiryInputSchema = z.strictObject({
	status: statusSchema,
});
export type InquiryInput = z.infer<typeof inquiryInputSchema>;

export function newInquiryInput(): InquiryInput {
	return {
		status: "new",
	};
}

export function inquiryInputFromRecord(record: Inquiry): InquiryInput {
	return {
		status: record.status,
	};
}
