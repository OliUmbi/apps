import type { Page, PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { showcase } from "../schema";
import { updateMissError } from "./errors";
import type { Showcase, ShowcaseInput, ShowcaseKey } from "./showcase";

export function createShowcaseRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput): Promise<Page<Showcase>> {
			return paginate<Showcase>(
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
		async get(key: ShowcaseKey): Promise<Showcase | null> {
			const [record] = await db
				.select()
				.from(showcase)
				.where(eq(showcase.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ShowcaseInput): Promise<Showcase> {
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
		async update(
			key: ShowcaseKey,
			input: ShowcaseInput,
			expectedUpdatedAt: string,
		): Promise<Showcase> {
			const [record] = await db
				.update(showcase)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(showcase.id, key.id),
						eq(showcase.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"unclet.showcase",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ShowcaseKey): Promise<void> {
			await db.delete(showcase).where(eq(showcase.id, key.id));
		},
	};
}
