import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { InquirySubject } from "../forms";
import { type InquiryStatus, inquiryStatusSchema } from "../statuses";

export const inquiryKeySchema = z.strictObject({
	id: idSchema,
});
export type InquiryKey = z.infer<typeof inquiryKeySchema>;

// The managed inquiry record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Inquiry {
	id: string;
	status: InquiryStatus;
	subject: InquirySubject;
	name: string;
	phone: string;
	email: string | null;
	message: string;
	submissionId: string | null;
	createdAt: string;
	updatedAt: string;
}

export const inquiryInputSchema = z.strictObject({
	status: inquiryStatusSchema,
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
