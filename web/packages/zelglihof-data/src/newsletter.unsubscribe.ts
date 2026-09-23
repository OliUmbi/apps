import type { DatabasePool } from "@oliumbi/database";
import { createNewsletterRepository } from "./newsletter.repository";

export function unsubscribeByToken(database: DatabasePool, token: string) {
	return database.transaction(async (transaction) => {
		const repository = createNewsletterRepository(transaction);
		const subscriber = await repository.byUnsubscribe(token);
		if (!subscriber) return { outcome: "invalid" as const };
		if (subscriber.status === "unsubscribed")
			return { outcome: "already-unsubscribed" as const };
		await repository.unsubscribe(subscriber.id, new Date());
		return { outcome: "unsubscribed" as const };
	});
}
