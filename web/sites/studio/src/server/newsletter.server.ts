import { getDatabase } from "@oliumbi/database";
import {
	correctSubscriberEmail,
	deleteSubscriber,
	listSubscribers,
	resendConfirmation,
	unsubscribeSubscriber,
} from "@oliumbi/newsletter";
import { requireActor } from "./auth.server";

function database() {
	return getDatabase(process.env.DATABASE_URL);
}
function publicUrl() {
	return process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003";
}

async function messaging(path: string, init?: RequestInit) {
	const token = process.env.MESSAGING_INTERNAL_TOKEN;
	const response = await fetch(
		new URL(path, process.env.MESSAGING_SERVICE_URL ?? "http://localhost:8082"),
		{
			...init,
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Token": token ?? "",
				...init?.headers,
			},
		},
	);
	if (!response.ok)
		throw new Error(`Messaging request failed (${response.status})`);
	return response;
}

export async function overview() {
	await requireActor();
	const [subscribers, failedResponse] = await Promise.all([
		listSubscribers(database()),
		messaging("/internal/messages/failed"),
	]);
	return {
		subscribers,
		failedMessages: (await failedResponse.json()) as FailedMessage[],
	};
}

export async function unsubscribe(id: string) {
	await requireActor();
	await unsubscribeSubscriber(database(), id);
}
export async function resend(id: string) {
	await requireActor();
	await resendConfirmation(database(), id, publicUrl());
}
export async function correct(id: string, email: string) {
	await requireActor();
	await correctSubscriberEmail(database(), id, email, publicUrl());
}
export async function remove(id: string) {
	await requireActor();
	await messaging("/internal/messages/scrub", {
		method: "POST",
		body: JSON.stringify({ correlationKey: `newsletter-subscriber:${id}` }),
	});
	await deleteSubscriber(database(), id);
}
export async function retryMessage(id: string) {
	await requireActor();
	await messaging(`/internal/messages/${id}/retry`, { method: "POST" });
}

export interface FailedMessage {
	id: string;
	messageType: string;
	recipientEmail: string;
	attemptCount: number;
	lastError: string;
	createdAt: string;
}
