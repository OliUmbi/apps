import { createServerFn } from "@tanstack/react-start";
import { inquirySchema } from "./inquiry.schema";
import { saveInquiry } from "./inquiry.server";

export const sendInquiry = createServerFn({ method: "POST" })
	.validator(inquirySchema)
	.handler(({ data }) => saveInquiry(data));
