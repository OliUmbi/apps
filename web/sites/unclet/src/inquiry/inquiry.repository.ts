import type { OutgoingMessage } from "@oliumbi/messaging";
import { database } from "../server/database.server";
import { insertOutgoingMessages } from "../server/outgoing-message.repository";
import type { InquiryInput } from "./inquiry.schema";

export async function insertInquiryWithNotifications(
	id: string,
	input: InquiryInput,
	notifications: OutgoingMessage[],
	now: Date,
) {
	await database.transaction(async (sql) => {
		await sql`
			insert into unclet.inquiry (
				id, customer_name, email, phone, event_date, location, guest_count, note,
				status, created_at, updated_at
			) values (
				${id}, ${input.name}, ${input.email || null}, ${input.phone || null},
				${input.date || null}, ${input.location}, ${input.guests},
				${input.note || null}, 'new', ${now}, ${now}
			)
		`;
		await insertOutgoingMessages(sql, notifications);
	});
}
