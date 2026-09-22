import type { Database, Transaction } from "@oliumbi/database";
import type { ReviewInput } from "./forms";

export function createReviewRepository(sql: Database | Transaction) {
	return {
		async submit(input: ReviewInput): Promise<void> {
			await sql`
				INSERT INTO unclet.review (stars, name, description, visible, created_at, updated_at)
				VALUES (${input.stars}, ${input.name}, ${input.description}, false, now(), now())
			`;
		},
	};
}
