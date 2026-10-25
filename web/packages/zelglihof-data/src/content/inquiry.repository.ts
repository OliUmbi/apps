import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { inquiry } from "../schema";
import { updateMissError } from "./errors";
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
		async update(
			key: InquiryKey,
			input: InquiryInput,
			expectedUpdatedAt: string,
		) {
			const [record] = await db
				.update(inquiry)
				.set({ status: input.status, updatedAt: new Date().toISOString() })
				.where(
					and(eq(inquiry.id, key.id), eq(inquiry.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.inquiry",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: InquiryKey): Promise<void> {
			await db.delete(inquiry).where(eq(inquiry.id, key.id));
		},
	};
}
