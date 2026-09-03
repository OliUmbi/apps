import {
	correctSubscriberEmail,
	deleteSubscriber,
	listSubscribers,
	resendConfirmation,
	unsubscribeSubscriber,
} from "@oliumbi/newsletter";
import { requireActor } from "../../server/auth.server";
import { database } from "../../server/database.server";
import {
	dispatchOutgoingMessages,
	messaging,
} from "../../server/messaging.server";

function publicUrl() {
	return process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003";
}

export async function overview() {
	await requireActor();
	const [subscribers, failedMessages] = await Promise.all([
		listSubscribers(database.sql),
		messaging.failedMessages(),
	]);
	return { subscribers, failedMessages };
}

export async function unsubscribe(id: string) {
	await requireActor();
	await unsubscribeSubscriber(database.sql, id);
}
export async function resend(id: string) {
	await requireActor();
	await resendConfirmation(database.sql, id, publicUrl());
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
}
export async function correct(id: string, email: string) {
	await requireActor();
	await correctSubscriberEmail(database.sql, id, email, publicUrl());
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
}
export async function remove(id: string) {
	await requireActor();
	await messaging.scrubMessages(`newsletter-subscriber:${id}`);
	await deleteSubscriber(database.sql, id);
}
export async function retryMessage(id: string) {
	await requireActor();
	await messaging.retryMessage(id);
}

function reportDispatchFailure(error: unknown) {
	console.error("Studio message relay failed", error);
}

export type { FailedMessage } from "@oliumbi/messaging";
