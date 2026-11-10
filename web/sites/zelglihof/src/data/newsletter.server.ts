import { createNewsletterService } from "@oliumbi/zelglihof-data/newsletter.service";
import { database } from "../server/database.server";

function newsletterService() {
	return createNewsletterService(database, {
		publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
		sender:
			process.env.ZELGLIHOF_NEWSLETTER_EMAIL ??
			"newsletter@zelglihof-maegenwil.ch",
		replyTo:
			process.env.ZELGLIHOF_REQUESTS_EMAIL ?? "hof@zelglihof-maegenwil.ch",
	});
}

export const requestNewsletter = (email: string, website?: string) =>
	newsletterService().request(email, website);
export const confirmNewsletter = (token: string) =>
	newsletterService().confirm(token);
export const unsubscribeNewsletter = (token: string) =>
	newsletterService().unsubscribe(token);
