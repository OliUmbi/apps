import type { Transaction } from "@oliumbi/database";
import type { QueuedEmail } from "./message";

export type { QueuedEmail } from "./message";

/** Use the caller's transaction so its data and message commit together. */
export function createQueueClient(sql: Transaction) {
	return {
		async enqueue(message: QueuedEmail): Promise<void> {
			await sql`
				INSERT INTO queue.message (id, site, type, sender, recipient, subject, text, html)
				VALUES (
					${message.id}, ${message.site}, 'email', ${message.sender},
					${message.recipient}, ${message.subject}, ${message.text}, ${message.html}
				)
				ON CONFLICT (id) DO NOTHING
			`;
		},
	};
}
