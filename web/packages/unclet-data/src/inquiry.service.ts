import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type InquirySubmissionInput, inquirySchema } from "./forms";
import { inquiryEmails } from "./inquiry.email";
import { createInquirySubmissionRepository } from "./inquiry.repository";

export interface InquiryPlan {
	outcome: "accepted";
	insert: boolean;
}

// Pure decision point: a replayed submission reports the original outcome and writes nothing.
export function decideInquiry(input: { replayed: boolean }): InquiryPlan {
	return { outcome: "accepted", insert: !input.replayed };
}

export function createInquiryService(
	database: DatabasePool,
	requestsEmail: string,
) {
	return {
		async submit(input: InquirySubmissionInput) {
			const values = inquirySchema.parse(input);
			const reference = referenceFor(values.submissionId);
			return database.transaction(async (transaction) => {
				const repository = createInquirySubmissionRepository(transaction);
				const plan = decideInquiry({
					replayed:
						(await repository.findBySubmissionId(values.submissionId)) !== null,
				});
				// The unique submission index absorbs a lost insert race to one row
				// and one set of queued emails.
				if (
					plan.insert &&
					(await repository.insert(randomUUID(), values, new Date()))
				) {
					const queue = createQueueClient(transaction);
					for (const message of inquiryEmails(requestsEmail, values, reference))
						await queue.enqueue(message);
				}
				return { outcome: plan.outcome, reference };
			});
		},
	};
}
