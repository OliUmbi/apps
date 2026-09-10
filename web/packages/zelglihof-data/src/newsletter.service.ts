import type { DatabasePool } from "@oliumbi/database";
import type { NewsletterOptions } from "./newsletter.types";
import { confirmSubscription } from "./newsletter-confirm";
import { requestSubscription } from "./newsletter-subscribe";
import { unsubscribeByToken } from "./newsletter-unsubscribe";
export function createNewsletterService(
	database: DatabasePool,
	options: NewsletterOptions,
) {
	return {
		request: (email: string) => requestSubscription(database, options, email),
		confirm: (token: string) => confirmSubscription(database, options, token),
		unsubscribe: (token: string) => unsubscribeByToken(database, token),
	};
}
