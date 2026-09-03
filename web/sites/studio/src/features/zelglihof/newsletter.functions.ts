import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	correct,
	remove,
	resend,
	retryMessage,
	unsubscribe,
} from "./newsletter.server";

const newsletterAction = z.discriminatedUnion("action", [
	z.object({ action: z.literal("unsubscribe"), id: z.uuid() }),
	z.object({ action: z.literal("resend"), id: z.uuid() }),
	z.object({
		action: z.literal("correct"),
		id: z.uuid(),
		email: z.email().max(320),
	}),
	z.object({ action: z.literal("delete"), id: z.uuid() }),
	z.object({ action: z.literal("retry-message"), id: z.uuid() }),
]);

export type NewsletterActionInput = z.infer<typeof newsletterAction>;

export const performNewsletterAction = createServerFn({ method: "POST" })
	.validator(newsletterAction)
	.handler(async ({ data }) => {
		switch (data.action) {
			case "unsubscribe":
				await unsubscribe(data.id);
				break;
			case "resend":
				await resend(data.id);
				break;
			case "correct":
				await correct(data.id, data.email);
				break;
			case "delete":
				await remove(data.id);
				break;
			case "retry-message":
				await retryMessage(data.id);
				break;
		}
		return { success: true };
	});
