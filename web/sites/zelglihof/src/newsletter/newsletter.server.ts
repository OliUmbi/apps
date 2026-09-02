import { getDatabase } from "@oliumbi/database";
import {
	confirmSubscription,
	requestSubscription,
	unsubscribeByToken,
} from "@oliumbi/newsletter";

function database() {
	return getDatabase(process.env.DATABASE_URL);
}

function publicBaseUrl(): string {
	return process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003";
}

export function requestNewsletter(input: {
	email: string;
	locale: "de-CH" | "en";
}) {
	return requestSubscription(database(), {
		...input,
		consentSource: "zelglihof-website",
		publicBaseUrl: publicBaseUrl(),
	});
}

export function confirmNewsletter(token: string) {
	return confirmSubscription(database(), token, publicBaseUrl());
}

export function unsubscribeNewsletter(token: string) {
	return unsubscribeByToken(database(), token);
}
