import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { welcomeEmail } from "./newsletter.email";
import { createNewsletterRepository } from "./newsletter.repository";
import { confirmationLifetimeMs, hashToken } from "./newsletter.tokens";
import type { NewsletterOptions } from "./newsletter.types";

export function confirmSubscription(
	database: DatabasePool,
	options: NewsletterOptions,
	token: string,
) {
	return database.transaction(async (transaction) => {
		const repository = createNewsletterRepository(transaction);
		const subscriber = await repository.byConfirmation(hashToken(token));
		if (!subscriber) return { outcome: "invalid" as const };
		if (subscriber.status === "active")
			return { outcome: "already-confirmed" as const };
		if (subscriber.status !== "pending") return { outcome: "invalid" as const };
		const now = new Date();
		if (
			now.getTime() - Date.parse(subscriber.requestedAt) >
			confirmationLifetimeMs
		)
			return { outcome: "expired" as const };
		await repository.confirm(subscriber.id, now);
		await createQueueClient(transaction).enqueue(
			welcomeEmail(options, subscriber.email, subscriber.unsubscribeToken),
		);
		return { outcome: "confirmed" as const };
	});
}
