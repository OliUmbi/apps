import type { Transaction } from "@oliumbi/database";
import type { ContactInput } from "./forms";

export function createInquiryRepository(sql: Transaction) {
	return {
		async insert(id: string, input: ContactInput, now: Date): Promise<void> {
			await sql`
				INSERT INTO zelglihof.inquiry (
					id, status, name, phone, email, message, created_at, updated_at
				) VALUES (
					${id}, 'new', ${input.name}, ${input.phone}, ${input.email || null},
					${input.message}, ${now}, ${now}
				)
			`;
		},
	};
}
