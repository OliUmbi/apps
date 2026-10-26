import { mapErrors } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { type ReviewSubmissionInput, reviewSchema } from "./forms";
import { createReviewSubmissionRepository } from "./review.repository";

// The public review form's outcome: always accepted. A reviewer sees the same
// verdict whether the row lands in the moderation queue or the fill is a
// honeypot drop (X-04); moderation decides visibility later.
export interface ReviewSubmissionResult {
	outcome: "accepted";
}

export interface ReviewPlan {
	outcome: "accepted";
	insert: boolean;
}

// Pure decision point: only a filled honeypot (X-04) changes the plan - the
// fill is dropped silently so the bot learns nothing from the answer. The row
// it would create stays moderation-hidden (`visible: false`) either way.
export function decideReview(input: { honeypot: boolean }): ReviewPlan {
	return { outcome: "accepted", insert: !input.honeypot };
}

// Submission workflow service: every sibling public flow goes through a
// service, and the review now does too (W-28), so the honeypot check and the
// typed outcome live in one place instead of at the site call site.
export function createReviewService(db: DatabaseExecutor) {
	return {
		async submit(
			input: ReviewSubmissionInput,
		): Promise<ReviewSubmissionResult> {
			// One boundary: schema failures leave typed as validation verdicts and
			// driver failures as classified conflict/not-found/internal errors.
			return mapErrors(async () => {
				const values = reviewSchema.parse(input);
				const plan = decideReview({ honeypot: Boolean(values.website) });
				// Honeypot (X-04): a filled `website` marks a scripted submit; it is
				// dropped silently - success-shaped answer, no row - so the bot learns
				// nothing. Throttling beyond this stays the deliberate proxy
				// rate-limit gap (see documentation/open-work.md technical debt).
				if (plan.insert)
					await createReviewSubmissionRepository(db).submit(values);
				return { outcome: plan.outcome };
			});
		},
	};
}
