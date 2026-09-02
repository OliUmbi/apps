import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { currentActor, login, logout } from "./auth.server";
import {
	correct,
	overview,
	remove,
	resend,
	retryMessage,
	unsubscribe,
} from "./newsletter.server";

export const getStudioState = createServerFn({ method: "GET" }).handler(
	async () => {
		const actor = await currentActor();
		if (!actor) return { actor: null, data: null };
		return { actor, data: await overview() };
	},
);

export const loginToStudio = createServerFn({ method: "POST" })
	.validator(
		z.object({
			username: z.string().min(1).max(100),
			password: z.string().min(1).max(1000),
		}),
	)
	.handler(async ({ data }) => login(data.username, data.password));

export const logoutFromStudio = createServerFn({ method: "POST" }).handler(
	logout,
);

const subscriberAction = z.discriminatedUnion("action", [
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

export type StudioActionInput = z.infer<typeof subscriberAction>;

export const performStudioAction = createServerFn({ method: "POST" })
	.validator(subscriberAction)
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
