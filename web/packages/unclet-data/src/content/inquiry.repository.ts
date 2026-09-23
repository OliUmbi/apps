import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { inquiry } from "../schema";
import type { InquiryInput, InquiryKey } from "./inquiry";

export function createInquiryRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(inquiry)
					.where(
						input.search
							? ilike(inquiry.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(inquiry.createdAt), inquiry.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: InquiryKey) {
			const [record] = await db
				.select()
				.from(inquiry)
				.where(eq(inquiry.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async update(key: InquiryKey, input: InquiryInput) {
			const [record] = await db
				.update(inquiry)
				.set({ status: input.status, updatedAt: new Date().toISOString() })
				.where(eq(inquiry.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: InquiryKey): Promise<void> {
			await db.delete(inquiry).where(eq(inquiry.id, key.id));
		},
	};
}
