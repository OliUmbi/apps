import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { member } from "../schema";
import type { MemberInput, MemberKey } from "./member";

export function createMemberRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(member)
					.where(
						input.search
							? ilike(member.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(member.createdAt), member.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: MemberKey) {
			const [record] = await db
				.select()
				.from(member)
				.where(eq(member.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: MemberInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(member)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: MemberKey, input: MemberInput) {
			const [record] = await db
				.update(member)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(member.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: MemberKey): Promise<void> {
			await db.delete(member).where(eq(member.id, key.id));
		},
	};
}
