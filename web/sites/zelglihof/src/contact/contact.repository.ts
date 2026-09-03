import type { OutgoingMessage } from "@oliumbi/messaging";
import { database } from "../server/database.server";
import { insertOutgoingMessages } from "../server/outgoing-message.repository";
import type { ContactInput } from "./contact.schema";

export async function insertContactInquiryWithNotification(
	id: string,
	input: ContactInput,
	subject: string,
	notification: OutgoingMessage,
	now: Date,
) {
	await database.transaction(async (sql) => {
		await sql`
			insert into zelglihof.contact_inquiry (
				id, customer_name, email, phone, subject, message, status, created_at, updated_at
			) values (
				${id}, ${input.name}, ${input.email || null}, ${input.phone || null},
				${subject}, ${input.message}, 'new', ${now}, ${now}
			)
		`;
		await insertOutgoingMessages(sql, [notification]);
	});
}
