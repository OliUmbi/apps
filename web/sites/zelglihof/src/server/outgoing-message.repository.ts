import type { Transaction } from "@oliumbi/database";
import type {
	OutgoingMessage,
	OutgoingMessageStore,
	PendingOutgoingMessage,
} from "@oliumbi/messaging";
import { database } from "./database.server";

export async function insertOutgoingMessages(
	sql: Transaction,
	messages: OutgoingMessage[],
): Promise<void> {
	for (const message of messages) {
		await sql`
			insert into zelglihof.outgoing_message (
				id, message_type, recipient_email, locale, payload, correlation_key,
				attempt_count, available_at, created_at, updated_at
			) values (
				${message.id}, ${message.messageType}, ${message.recipientEmail},
				${message.locale}, ${sql.json(message.payload)}, ${message.correlationKey},
				${0}, ${message.createdAt}, ${message.createdAt}, ${message.createdAt}
			)
		`;
	}
}

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
