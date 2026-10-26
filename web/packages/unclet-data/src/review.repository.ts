import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { sql } from "drizzle-orm";
import type { ReviewSubmissionInput } from "./forms";
import { review } from "./schema";

// Submission workflow repository: the public review form's write path. Named
// for its role so it never reads like the studio CRUD repository in
// content/review.repository.ts.
export function createReviewSubmissionRepository(db: DatabaseExecutor) {
	return guardRepository({
		async submit(input: ReviewSubmissionInput): Promise<void> {
			await db.insert(review).values({
				stars: input.stars,
				name: input.name,
				description: input.description,
				visible: false,
				createdAt: sql`now()`,
				updatedAt: sql`now()`,
			});
		},
	});
}
