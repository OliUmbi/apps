import { randomUUID } from "node:crypto";
import type { DatabasePool } from "@oliumbi/database";
import { createQueueClient } from "@oliumbi/queue";
import { referenceFor } from "@oliumbi/queue/email";
import { type ContactInput, contactSchema } from "./forms";
import { inquiryNotification } from "./inquiry.email";
import { createInquiryRepository } from "./inquiry.repository";

export function createInquiryService(database: DatabasePool, sender: string) {
	return {
		async submit(input: ContactInput) {
			const values = contactSchema.parse(input);
			const id = randomUUID();
			const reference = referenceFor(id);
			await database.transaction(async (sql) => {
				await createInquiryRepository(sql).insert(id, values, new Date());
				await createQueueClient(sql).enqueue(
					inquiryNotification(values, reference, sender),
				);
			});
			return { outcome: "sent" as const, reference };
		},
	};
}
