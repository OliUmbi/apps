import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { event } from "../schema";
import { updateMissError } from "./errors";
import type { Event, EventInput, EventKey } from "./event";

export function createEventRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Event>> {
			return paginate<Event>(
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
		async get(key: EventKey): Promise<Event | null> {
			const [record] = await db
				.select()
				.from(event)
				.where(eq(event.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: EventInput): Promise<Event> {
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
		async update(key: EventKey, input: EventInput, expectedUpdatedAt: string) {
			const [record] = await db
				.update(event)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(event.id, key.id), eq(event.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"jublawoma.event",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: EventKey): Promise<void> {
			await db.delete(event).where(eq(event.id, key.id));
		},
	};
}
