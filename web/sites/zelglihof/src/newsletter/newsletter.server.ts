import { createNewsletterService } from "@oliumbi/zelglihof-data/newsletter.service";
import { database } from "../server/database.server";

function service() {
	return createNewsletterService(database, {
		publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
		sender: process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
	});
}
export const requestNewsletter = (input: { email: string; locale: string }) =>
	service().request(input.email);
export const confirmNewsletter = (token: string) => service().confirm(token);
export const unsubscribeNewsletter = (token: string) =>
	service().unsubscribe(token);
