import { createServerFn } from "@tanstack/react-start";
import { contactSchema } from "./contact.schema";
import { saveContactInquiry } from "./contact.server";

export const sendContactInquiry = createServerFn({ method: "POST" })
	.validator(contactSchema)
	.handler(({ data }) => saveContactInquiry(data));
