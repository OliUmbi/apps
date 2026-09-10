import type { Transaction } from "@oliumbi/database";
import type { InquiryInput } from "./forms";

export function createInquiryRepository(sql: Transaction) {
	return {
		async insert(id: string, input: InquiryInput, now: Date): Promise<void> {
			await sql`
				INSERT INTO unclet.inquiry (
					id, status, name, email, phone, event_on, location, guest_count,
					note, created_at, updated_at
				) VALUES (
					${id}, 'new', ${input.name}, ${input.email}, ${input.phone},
					${input.date || null}, ${input.location || null}, ${input.guests},
					${input.note || null}, ${now}, ${now}
				)
			`;
		},
	};
}
