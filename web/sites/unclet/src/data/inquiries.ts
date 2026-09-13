import {
	type InquiryInput,
	inquirySchema,
} from "@oliumbi/unclet-data/contracts";
import { createInquiryService } from "@oliumbi/unclet-data/inquiry.service";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export { type InquiryInput, inquirySchema };

export const sendInquiry = createServerFn({ method: "POST" })
	.validator(inquirySchema)
	.handler(({ data }) => saveInquiry(data));

function saveInquiry(input: InquiryInput) {
	return createInquiryService(
		database,
		process.env.UNCLET_OWNER_EMAIL ?? "info@uncle-t.ch",
	).submit(input);
}
