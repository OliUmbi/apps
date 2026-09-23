import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { showcase } from "../schema";
import type { ShowcaseInput, ShowcaseKey } from "./showcase";

export function createShowcaseRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(showcase)
					.where(
						input.search
							? ilike(showcase.title, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(showcase.createdAt), showcase.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: ShowcaseKey) {
			const [record] = await db
				.select()
				.from(showcase)
				.where(eq(showcase.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ShowcaseInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(showcase)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: ShowcaseKey, input: ShowcaseInput) {
			const [record] = await db
				.update(showcase)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(showcase.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ShowcaseKey): Promise<void> {
			await db.delete(showcase).where(eq(showcase.id, key.id));
		},
	};
}
