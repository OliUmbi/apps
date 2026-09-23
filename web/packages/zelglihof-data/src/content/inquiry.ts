import { idSchema, statusSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { inquiry } from "../schema";

export const inquiryKeySchema = z.strictObject({
	id: idSchema,
});
export type InquiryKey = z.infer<typeof inquiryKeySchema>;

export type Inquiry = typeof inquiry.$inferSelect;

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
