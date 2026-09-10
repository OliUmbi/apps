import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createMessagingClient } from "@oliumbi/messaging";
import { createServerFn } from "@tanstack/react-start";
import { requireActor } from "./auth.server";

const messaging = createMessagingClient({
	baseUrl: () => process.env.MESSAGING_SERVICE_URL ?? "http://localhost:8082",
	token: () => process.env.MESSAGING_INTERNAL_AUTHORIZATION_TOKEN,
});
export const listMessages = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return messaging.list(data.page, data.size);
	});
export const getMessage = createServerFn({ method: "GET" })
	.validator(idSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return messaging.get(data);
	});
