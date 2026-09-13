import { emailSchema } from "@oliumbi/contracts";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { confirmationEmail } from "./newsletter.email";
import { newsletterRepository } from "./newsletter.repository";
import { hashToken, newToken, resendDelayMs } from "./newsletter.tokens";
import type { NewsletterOptions } from "./newsletter.types";
export async function requestSubscription(
	database: DatabasePool,
	options: NewsletterOptions,
	email: string,
) {
	const normalized = emailSchema.parse(email);
	await database.transaction(async (sql) => {
		const repository = newsletterRepository(sql);
		const now = new Date();
		await repository.lockEmail(normalized);
		const existing = await repository.byEmail(normalized);
		if (existing?.status === "active") return;
		if (
			existing?.status === "pending" &&
			now.getTime() - existing.requested_at.getTime() < resendDelayMs
		)
			return;
		const token = newToken();
		await repository.request(normalized, hashToken(token), newToken(), now);
		await createQueueClient(sql).enqueue(
			confirmationEmail(options, normalized, token),
		);
	});
	return { outcome: "accepted" as const };
}
