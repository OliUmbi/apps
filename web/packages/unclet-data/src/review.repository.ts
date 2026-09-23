import type { DatabaseExecutor } from "@oliumbi/database";
import { sql } from "drizzle-orm";
import type { ReviewInput } from "./forms";
import { review } from "./schema";

export function createReviewRepository(db: DatabaseExecutor) {
	return {
		async submit(input: ReviewInput): Promise<void> {
			await db.insert(review).values({
				stars: input.stars,
				name: input.name,
				description: input.description,
				visible: false,
				createdAt: sql`now()`,
				updatedAt: sql`now()`,
			});
		},
	};
}
