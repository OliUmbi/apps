import type {
	OutgoingMessageStore,
	PendingOutgoingMessage,
} from "@oliumbi/messaging";
import { database } from "./database.server";

export const outgoingMessageStore: OutgoingMessageStore = {
	findDue(now, limit) {
		return database.sql<PendingOutgoingMessage[]>`
			select id, message_type as "messageType", recipient_email as "recipientEmail",
				locale, payload, correlation_key as "correlationKey",
				created_at::text as "createdAt", attempt_count as "attemptCount"
			from zelglihof.outgoing_message
			where available_at <= ${now}
			order by created_at
			limit ${limit}
		`;
	},
	async markDelivered(id) {
		await database.sql`delete from zelglihof.outgoing_message where id = ${id}`;
	},
	async markFailed(id, attemptCount, availableAt, lastError, updatedAt) {
		await database.sql`
			update zelglihof.outgoing_message
			set attempt_count = ${attemptCount}, available_at = ${availableAt},
				last_error = ${lastError}, updated_at = ${updatedAt}
			where id = ${id}
		`;
	},
};
