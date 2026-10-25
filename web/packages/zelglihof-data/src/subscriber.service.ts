import { emailSchema, idSchema } from "@oliumbi/contracts";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { confirmationEmail } from "./newsletter.email";
import { createNewsletterRepository } from "./newsletter.repository";
import { hashToken, newToken } from "./newsletter.tokens";
import type { NewsletterOptions } from "./newsletter.types";

export type CorrectionOutcome = "corrected" | "conflict";

export interface CorrectionResult {
	outcome: CorrectionOutcome;
}

export interface CorrectionPlan {
	outcome: CorrectionOutcome;
	// The new address has never confirmed: pending and active subscribers go
	// back to pending with a fresh confirmation.
	restartConfirmation: boolean;
}

// Pure decision point: an address owned by another subscriber is a typed
// conflict, and an unsubscribed subscriber is never silently re-subscribed by
// an address correction.
export function decideCorrection(input: {
	conflict: boolean;
	status: "pending" | "active" | "unsubscribed";
}): CorrectionPlan {
	if (input.conflict)
		return { outcome: "conflict", restartConfirmation: false };
	return {
		outcome: "corrected",
		restartConfirmation: input.status !== "unsubscribed",
	};
}

// A lost insert race can still surface as a unique violation; it is a conflict,
// never a raw database error at the call boundary.
function isUniqueViolation(error: unknown): boolean {
	const failure = error as { code?: string; cause?: { code?: string } } | null;
	return (failure?.code ?? failure?.cause?.code) === "23505";
}

export function createSubscriberService(
	database: DatabasePool,
	options: NewsletterOptions,
) {
	return {
		unsubscribe(id: string) {
			idSchema.parse(id);
			return database.transaction(async (transaction) => {
				const repository = createNewsletterRepository(transaction);
				const subscriber = await repository.byId(id);
				if (!subscriber) throw new Error("Subscriber not found");
				await repository.unsubscribe(id, new Date());
			});
		},
		correctEmail(id: string, email: string): Promise<CorrectionResult> {
			idSchema.parse(id);
			const normalized = emailSchema.parse(email);
			return database
				.transaction(async (transaction) => {
					const repository = createNewsletterRepository(transaction);
					// The advisory lock serializes every writer of this address, so
					// the ownership check cannot race a concurrent signup.
					await repository.lockEmail(normalized);
					const subscriber = await repository.byId(id);
					if (!subscriber) throw new Error("Subscriber not found");
					const owner = await repository.byEmail(normalized);
					const plan = decideCorrection({
						conflict: Boolean(owner && owner.id !== id),
						status: subscriber.status,
					});
					if (plan.outcome === "conflict") return { outcome: plan.outcome };
					const now = new Date();
					if (plan.restartConfirmation) {
						const token = newToken();
						await repository.restartConfirmation(
							id,
							normalized,
							hashToken(token),
							now,
						);
						await createQueueClient(transaction).enqueue(
							confirmationEmail(options, normalized, token),
						);
					} else {
						await repository.changeEmail(id, normalized, now);
					}
					return { outcome: plan.outcome };
				})
				.catch((error: unknown) => {
					if (isUniqueViolation(error)) return { outcome: "conflict" as const };
					throw error;
				});
		},
	};
}
