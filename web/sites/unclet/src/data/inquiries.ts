import {
	type InquirySubmissionInput,
	inquirySchema,
} from "@oliumbi/unclet-data/forms";
import { createInquiryService } from "@oliumbi/unclet-data/inquiry.service";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export { type InquirySubmissionInput, inquirySchema };

export const sendInquiry = createServerFn({ method: "POST" })
	.validator(inquirySchema)
	.handler(({ data }) => saveInquiry(data));

function saveInquiry(input: InquirySubmissionInput) {
	return createInquiryService(
		database,
		process.env.UNCLET_REQUESTS_EMAIL ?? "info@uncle-t.ch",
	).submit(input);
}
