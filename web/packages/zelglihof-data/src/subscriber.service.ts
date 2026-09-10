import { emailSchema, idSchema } from "@oliumbi/contracts";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { confirmationEmail } from "./newsletter.email";
import { newsletterRepository } from "./newsletter.repository";
import { hashToken, newToken } from "./newsletter.tokens";
import type { NewsletterOptions } from "./newsletter.types";
export function createSubscriberService(
	database: DatabasePool,
	options: NewsletterOptions,
) {
	return {
		unsubscribe(id: string) {
			idSchema.parse(id);
			return database.transaction(async (sql) => {
				const repository = newsletterRepository(sql);
				const subscriber = await repository.byId(id);
				if (!subscriber) throw new Error("Subscriber not found");
				await repository.unsubscribe(id, new Date());
			});
		},
		correctEmail(id: string, email: string) {
			idSchema.parse(id);
			const normalized = emailSchema.parse(email);
			return database.transaction(async (sql) => {
				const repository = newsletterRepository(sql);
				await repository.lockEmail(normalized);
				const subscriber = await repository.byId(id);
				if (!subscriber) throw new Error("Subscriber not found");
				const token = newToken();
				await repository.correctEmail(
					id,
					normalized,
					hashToken(token),
					new Date(),
				);
				await createQueueClient(sql).enqueue(
					confirmationEmail(options, normalized, token),
				);
			});
		},
	};
}
