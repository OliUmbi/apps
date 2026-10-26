import { emailSchema, mapErrors } from "@oliumbi/contracts";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { confirmationEmail } from "./newsletter.email";
import { createNewsletterRepository } from "./newsletter.repository";
import { hashToken, newToken, resendDelayMs } from "./newsletter.tokens";
import type { NewsletterOptions } from "./newsletter.types";

// A request either sends a confirmation or is deliberately suppressed; the two
// were one indistinguishable "accepted" before, which hid the no-op case from
// every caller.
export type SubscriptionOutcome = "confirmation-sent" | "suppressed";

export interface SubscriptionPlan {
	outcome: SubscriptionOutcome;
	// Whether to store the request and queue a confirmation email.
	send: boolean;
}

export interface SubscriptionResult {
	outcome: SubscriptionOutcome;
}

// Pure decision point: an already-active subscriber never gets a confirmation,
// and a pending address is not re-mailed inside the resend delay. Everything
// else (new, re-subscribe after unsubscribe, or a resend past the delay) sends.
export function decideSubscription(input: {
	status: "pending" | "active" | "unsubscribed" | null | undefined;
	requestedAt: string | null | undefined;
	now: number;
}): SubscriptionPlan {
	if (input.status === "active") return { outcome: "suppressed", send: false };
	if (
		input.status === "pending" &&
		input.now - Date.parse(input.requestedAt ?? "") < resendDelayMs
	)
		return { outcome: "suppressed", send: false };
	return { outcome: "confirmation-sent", send: true };
}

export async function requestSubscription(
	database: DatabasePool,
	options: NewsletterOptions,
	email: string,
	website?: string,
): Promise<SubscriptionResult> {
	// One boundary: schema failures leave typed as validation verdicts and
	// driver failures as classified conflict/not-found/internal errors.
	return mapErrors(async () => {
		const normalized = emailSchema.parse(email);
		// Honeypot (X-04): a filled `website` marks a scripted submit; it is
		// dropped silently - success-shaped answer, no row, no queued email - so
		// the bot learns nothing. Throttling beyond this stays the deliberate
		// proxy rate-limit gap (see documentation/open-work.md technical debt).
		if (website) return { outcome: "confirmation-sent" };
		const outcome = await database.transaction(async (transaction) => {
			const repository = createNewsletterRepository(transaction);
			const now = new Date();
			await repository.lockEmail(normalized);
			const existing = await repository.byEmail(normalized);
			const plan = decideSubscription({
				status: existing?.status,
				requestedAt: existing?.requestedAt,
				now: now.getTime(),
			});
			if (!plan.send) return plan.outcome;
			const token = newToken();
			// A re-subscribe keeps the stored unsubscribe token (delivered links stay
			// valid); a new subscriber gets a fresh one.
			const unsubscribeToken = existing?.unsubscribeToken ?? newToken();
			await repository.request(
				normalized,
				hashToken(token),
				unsubscribeToken,
				now,
			);
			await createQueueClient(transaction).enqueue(
				confirmationEmail(options, normalized, token),
			);
			return plan.outcome;
		});
		return { outcome };
	});
}
