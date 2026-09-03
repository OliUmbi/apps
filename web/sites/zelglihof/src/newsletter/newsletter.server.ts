import {
	confirmSubscription,
	requestSubscription,
	unsubscribeByToken,
} from "@oliumbi/newsletter";
import { database } from "../server/database.server";
import { dispatchOutgoingMessages } from "../server/messaging.server";

function publicBaseUrl(): string {
	return process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003";
}

export async function requestNewsletter(input: {
	email: string;
	locale: "de-CH" | "en";
}) {
	const result = await requestSubscription(database.sql, {
		...input,
		consentSource: "zelglihof-website",
		publicBaseUrl: publicBaseUrl(),
	});
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
	return result;
}

export async function confirmNewsletter(token: string) {
	const result = await confirmSubscription(
		database.sql,
		token,
		publicBaseUrl(),
	);
	void dispatchOutgoingMessages().catch(reportDispatchFailure);
	return result;
}

export function unsubscribeNewsletter(token: string) {
	return unsubscribeByToken(database.sql, token);
}

function reportDispatchFailure(error: unknown) {
	console.error("Newsletter notification dispatch failed", error);
}
