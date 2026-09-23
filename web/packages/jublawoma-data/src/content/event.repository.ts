import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { event } from "../schema";
import type { EventInput, EventKey } from "./event";

export function createEventRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(event)
					.where(
						input.search
							? ilike(event.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(event.createdAt), event.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: EventKey) {
			const [record] = await db
				.select()
				.from(event)
				.where(eq(event.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: EventInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(event)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: EventKey, input: EventInput) {
			const [record] = await db
				.update(event)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(event.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: EventKey): Promise<void> {
			await db.delete(event).where(eq(event.id, key.id));
		},
	};
}
