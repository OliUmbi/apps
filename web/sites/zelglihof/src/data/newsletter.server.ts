import { createNewsletterService } from "@oliumbi/zelglihof-data/newsletter.service";
import { database } from "../server/database.server";

function newsletterService() {
	return createNewsletterService(database, {
		publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
		sender: process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
	});
}

export const requestNewsletter = (email: string) =>
	newsletterService().request(email);
export const confirmNewsletter = (token: string) =>
	newsletterService().confirm(token);
export const unsubscribeNewsletter = (token: string) =>
	newsletterService().unsubscribe(token);
