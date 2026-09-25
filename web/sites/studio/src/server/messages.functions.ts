import { idSchema } from "@oliumbi/contracts";
import { createMessagingClient } from "@oliumbi/messaging";
import { createServerFn } from "@tanstack/react-start";
import { messageListSchema } from "../model/messages";
import { requireActor } from "./auth.server";

const messaging = createMessagingClient({
	baseUrl: () => process.env.MESSAGING_SERVICE_URL ?? "http://localhost:8082",
	token: () => process.env.MESSAGING_INTERNAL_AUTHORIZATION_TOKEN,
});
export const listMessages = createServerFn({ method: "GET" })
	.validator(messageListSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return messaging.list(
			data.page,
			data.size,
			data.filter === "failed" ? "FAILED" : undefined,
		);
	});
export const getMessage = createServerFn({ method: "GET" })
	.validator(idSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return messaging.get(data);
	});
