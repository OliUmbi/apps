import { guardRepository } from "@oliumbi/contracts";
import type { Transaction } from "@oliumbi/database";
import { eq } from "drizzle-orm";
import type { InquirySubmissionInput } from "./forms";
import { inquiry } from "./schema";

// Submission workflow repository: the public form's idempotent write path for
// one inquiry. Named for its role so it never reads like the studio CRUD
// repository in content/inquiry.repository.ts.
export function createInquirySubmissionRepository(transaction: Transaction) {
	return guardRepository({
		async findBySubmissionId(submissionId: string) {
			const [row] = await transaction
				.select({ id: inquiry.id })
				.from(inquiry)
				.where(eq(inquiry.submissionId, submissionId))
				.limit(1);
			return row ?? null;
		},
		async insert(
			id: string,
			input: InquirySubmissionInput,
			now: Date,
		): Promise<boolean> {
			const inserted = await transaction
				.insert(inquiry)
				.values({
					id,
					submissionId: input.submissionId,
					status: "new",
					name: input.name,
					phone: input.phone,
					email: input.email,
					eventOn: input.date || null,
					location: input.location || null,
					guestCount: input.guests,
					note: input.note || null,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				})
				.onConflictDoNothing({ target: inquiry.submissionId })
				.returning({ id: inquiry.id });
			return inserted.length > 0;
		},
	});
}
