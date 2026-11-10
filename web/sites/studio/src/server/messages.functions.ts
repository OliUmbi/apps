import { idSchema } from "@oliumbi/contracts";
import { createMessagingClient } from "@oliumbi/messaging";
import { createServerFn } from "@tanstack/react-start";
import { messageListSchema } from "../model/messages";
import { studioAuthorization } from "./studio-authorization";

const messaging = createMessagingClient({
	baseUrl: () => process.env.MESSAGING_SERVICE_URL ?? "http://localhost:8082",
	token: () => process.env.MESSAGING_INTERNAL_AUTHORIZATION_TOKEN,
});
export const listMessages = createServerFn({ method: "GET" })
	.middleware([studioAuthorization()])
	.validator(messageListSchema)
	.handler(async ({ data }) => {
		return messaging.list(
			data.page,
			data.size,
			data.filter === "failed" ? "FAILED" : undefined,
		);
	});
export const getMessage = createServerFn({ method: "GET" })
	.middleware([studioAuthorization()])
	.validator(idSchema)
	.handler(async ({ data }) => {
		return messaging.get(data);
	});
