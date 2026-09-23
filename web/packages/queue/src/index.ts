import type { Transaction } from "@oliumbi/database";
import type { QueuedEmail } from "./message";
import { message as queuedMessage } from "./schema";

export type { QueuedEmail } from "./message";

/** Use the caller's transaction so its data and message commit together. */
export function createQueueClient(transaction: Transaction) {
	return {
		async enqueue(message: QueuedEmail): Promise<void> {
			await transaction
				.insert(queuedMessage)
				.values({ ...message, type: "email" })
				.onConflictDoNothing({ target: queuedMessage.id });
		},
	};
}
