import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type InquiryInput, inquirySchema } from "./forms";
import { inquiryEmails } from "./inquiry.email";
import { createInquiryRepository } from "./inquiry.repository";

export function createInquiryService(database: DatabasePool, sender: string) {
	return {
		async submit(input: InquiryInput) {
			const values = inquirySchema.parse(input);
			const id = randomUUID();
			const reference = referenceFor(id);
			await database.transaction(async (sql) => {
				await createInquiryRepository(sql).insert(id, values, new Date());
				const queue = createQueueClient(sql);
				for (const message of inquiryEmails(sender, values, reference))
					await queue.enqueue(message);
			});
			return { outcome: "sent" as const, reference };
		},
	};
}
