import { database } from "../../server/database.server";
import type { InquiryStatus, UncleTInquiry } from "./inquiries.types";

export function findInquiries(): Promise<UncleTInquiry[]> {
	return database.sql<UncleTInquiry[]>`
		select id, customer_name as "customerName", email, phone,
			event_date::text as "eventDate", location, guest_count as "guestCount",
			note, status, created_at::text as "createdAt", updated_at::text as "updatedAt"
		from unclet.inquiry
		order by case when status in ('new', 'contacted', 'quoted') then 0 else 1 end,
			event_date nulls last, created_at desc
	`;
}

export async function setInquiryStatus(
	id: string,
	status: InquiryStatus,
	now: Date,
) {
	await database.sql`
		update unclet.inquiry
		set status = ${status}, updated_at = ${now}
		where id = ${id}
	`;
}
