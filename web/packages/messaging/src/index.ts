import { randomUUID } from "node:crypto";

export interface EmailMessage {
	recipient: string;
	subject: string;
	text: string;
	html: string;
	correlationKey?: string;
}

export interface OutgoingMessage {
	id: string;
	messageType: string;
	recipientEmail: string;
	locale: "de-CH" | "en";
	payload: Record<string, string>;
	correlationKey: string | null;
	createdAt: string;
}

export interface FailedMessage {
	id: string;
	messageType: string;
	recipientEmail: string;
	attemptCount: number;
	lastError: string;
	createdAt: string;
}

export interface MessagingClient {
	send(message: OutgoingMessage): Promise<void>;
	failedMessages(): Promise<FailedMessage[]>;
	retryMessage(id: string): Promise<void>;
	scrubMessages(correlationKey: string): Promise<void>;
}

export interface PendingOutgoingMessage extends OutgoingMessage {
	attemptCount: number;
}

export interface OutgoingMessageStore {
	findDue(now: Date, limit: number): Promise<PendingOutgoingMessage[]>;
	markDelivered(id: string): Promise<void>;
	markFailed(
		id: string,
		attemptCount: number,
		availableAt: Date,
		lastError: string,
		updatedAt: Date,
	): Promise<void>;
}

export function createEmailMessage(
	message: EmailMessage,
	now = new Date(),
): OutgoingMessage {
	return createOutgoingMessage({
		messageType: "email",
		recipientEmail: message.recipient,
		locale: "de-CH",
		payload: {
			subject: message.subject,
			text: message.text,
			html: message.html,
		},
		correlationKey: message.correlationKey,
		now,
	});
}

export function createOutgoingMessage(input: {
	messageType: string;
	recipientEmail: string;
	locale: "de-CH" | "en";
	payload: Record<string, string>;
	correlationKey?: string;
	now?: Date;
}): OutgoingMessage {
	return {
		id: randomUUID(),
		messageType: input.messageType,
		recipientEmail: input.recipientEmail,
		locale: input.locale,
		payload: input.payload,
		correlationKey: input.correlationKey ?? null,
		createdAt: (input.now ?? new Date()).toISOString(),
	};
}

export function createMessagingClient(options: {
	baseUrl: () => string;
	internalToken: () => string | undefined;
	timeoutMs?: number;
}): MessagingClient {
	async function request(path: string, init?: RequestInit): Promise<Response> {
		const token = options.internalToken();
		if (!token) throw new Error("MESSAGING_INTERNAL_TOKEN is not configured");

		const response = await fetch(new URL(path, options.baseUrl()), {
			...init,
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Token": token,
				...init?.headers,
			},
			signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
		});
		if (!response.ok) {
			throw new Error(`Messaging request failed (${response.status})`);
		}
		return response;
	}

	return {
		async send(message) {
			await request("/internal/messages", {
				method: "POST",
				body: JSON.stringify({
					id: message.id,
					messageType: message.messageType,
					recipientEmail: message.recipientEmail,
					locale: message.locale,
					payload: message.payload,
					correlationKey: message.correlationKey,
				}),
			});
		},
		async failedMessages() {
			const response = await request("/internal/messages/failed");
			return response.json() as Promise<FailedMessage[]>;
		},
		async retryMessage(id) {
			await request(`/internal/messages/${encodeURIComponent(id)}/retry`, {
				method: "POST",
			});
		},
		async scrubMessages(correlationKey) {
			await request("/internal/messages/scrub", {
				method: "POST",
				body: JSON.stringify({ correlationKey }),
			});
		},
	};
}

export function createMessageRelay(
	client: MessagingClient,
	store: OutgoingMessageStore,
) {
	let activeRun: Promise<void> | undefined;

	async function run(now: Date, limit: number) {
		const messages = await store.findDue(now, limit);
		for (const message of messages) {
			try {
				await client.send(message);
				await store.markDelivered(message.id);
			} catch (error) {
				const attemptCount = message.attemptCount + 1;
				const retryAt = new Date(
					now.getTime() + Math.min(30, 2 ** attemptCount) * 60_000,
				);
				await store.markFailed(
					message.id,
					attemptCount,
					retryAt,
					safeError(error),
					now,
				);
			}
		}
	}

	return {
		flush(now = new Date(), limit = 20): Promise<void> {
			if (!activeRun) {
				activeRun = run(now, limit).finally(() => {
					activeRun = undefined;
				});
			}
			return activeRun;
		},
	};
}

function safeError(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.slice(0, 2_000);
}
