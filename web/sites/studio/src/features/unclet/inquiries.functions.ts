import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { inquiryStatuses, updateInquiryStatus } from "./inquiries.server";

const inquiryStatusAction = z.object({
	action: z.literal("unclet-inquiry-status"),
	id: z.uuid(),
	status: z.enum(inquiryStatuses),
});

export const changeInquiryStatus = createServerFn({ method: "POST" })
	.validator(inquiryStatusAction)
	.handler(async ({ data }) => {
		await updateInquiryStatus(data.id, data.status);
		return { success: true };
	});
