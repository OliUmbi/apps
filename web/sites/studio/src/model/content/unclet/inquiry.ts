import { idSchema, statusSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	databaseDateSchema,
	optionalBodySchema,
	optionalTextSchema,
	titleSchema,
} from "../validation";

export const inquiryKeySchema = z.strictObject({
	id: idSchema,
});
export type InquiryKey = z.infer<typeof inquiryKeySchema>;

export const inquirySchema = z.object({
	id: idSchema,
	status: statusSchema,
	name: titleSchema,
	email: z.string(),
	phone: z.string(),
	eventOn: databaseDateSchema.nullable(),
	location: optionalTextSchema,
	guestCount: z.number().int().nonnegative().nullable(),
	note: optionalBodySchema,
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
