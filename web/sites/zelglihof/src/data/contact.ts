import {
	type ContactInput,
	contactSchema,
} from "@oliumbi/zelglihof-data/forms";
import { createInquiryService } from "@oliumbi/zelglihof-data/inquiry.service";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export { type ContactInput, contactSchema };

export const sendContactInquiry = createServerFn({ method: "POST" })
	.validator(contactSchema)
	.handler(({ data }) => saveContactInquiry(data));

function saveContactInquiry(input: ContactInput) {
	return createInquiryService(
		database,
		process.env.ZELGLIHOF_REQUESTS_EMAIL ?? "hof@zelglihof.ch",
	).submit(input);
}
