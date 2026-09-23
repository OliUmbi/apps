import type { Transaction } from "@oliumbi/database";
import type { InquiryInput } from "./forms";
import { inquiry } from "./schema";

export function createInquiryRepository(transaction: Transaction) {
	return {
		async insert(id: string, input: InquiryInput, now: Date): Promise<void> {
			await transaction.insert(inquiry).values({
				id,
				status: "new",
				name: input.name,
				phone: input.phone,
				email: input.email,
				eventOn: input.date || null,
				location: input.location || null,
				guestCount: input.guests,
				note: input.note || null,
				createdAt: now.toISOString(),
				updatedAt: now.toISOString(),
			});
		},
	};
}
