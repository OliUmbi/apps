import { createMessageRelay, createMessagingClient } from "@oliumbi/messaging";
import { outgoingMessageStore } from "./outgoing-message.repository";

export const messaging = createMessagingClient({
	baseUrl: () => process.env.MESSAGING_SERVICE_URL ?? "http://localhost:8082",
	internalToken: () => process.env.MESSAGING_INTERNAL_TOKEN,
});
const relay = createMessageRelay(messaging, outgoingMessageStore);

export function dispatchOutgoingMessages(): Promise<void> {
	return relay.flush(new Date());
}

if (
	process.env.DATABASE_URL &&
	process.env.MESSAGING_INTERNAL_TOKEN &&
	process.env.NODE_ENV !== "test"
) {
	const timer = setInterval(() => {
		void dispatchOutgoingMessages().catch((error) => {
			console.error("Studio message relay failed", error);
		});
	}, 5_000);
	timer.unref();
}
