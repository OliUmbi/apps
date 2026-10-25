import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type ContactInput, contactSchema } from "./forms";
import { inquiryNotification } from "./inquiry.email";
import { createInquiryRepository } from "./inquiry.repository";

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
		async submit(input: ContactInput) {
			const values = contactSchema.parse(input);
			const reference = referenceFor(values.submissionId);
			return database.transaction(async (transaction) => {
				const repository = createInquiryRepository(transaction);
				const plan = decideInquiry({
					replayed:
						(await repository.findBySubmissionId(values.submissionId)) !== null,
				});
				// The unique submission index absorbs a lost insert race to one row
				// and one queued email.
				if (
					plan.insert &&
					(await repository.insert(randomUUID(), values, new Date()))
				) {
					await createQueueClient(transaction).enqueue(
						inquiryNotification(values, reference, requestsEmail),
					);
				}
				return { outcome: plan.outcome, reference };
			});
		},
	};
}
