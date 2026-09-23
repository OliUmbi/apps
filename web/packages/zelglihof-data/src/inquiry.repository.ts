import type { Transaction } from "@oliumbi/database";
import type { ContactInput } from "./forms";
import { inquiry } from "./schema";

export function createInquiryRepository(transaction: Transaction) {
	return {
		async insert(id: string, input: ContactInput, now: Date): Promise<void> {
			await transaction.insert(inquiry).values({
				id,
				status: "new",
				name: input.name,
				phone: input.phone,
				email: input.email || null,
				message: input.message,
				createdAt: now.toISOString(),
				updatedAt: now.toISOString(),
			});
		},
	};
}
