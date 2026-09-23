import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { product } from "../schema";
import type { ProductInput, ProductKey } from "./product";

export function createProductRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(product)
					.where(
						input.search
							? ilike(product.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(product.createdAt), product.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: ProductKey) {
			const [record] = await db
				.select()
				.from(product)
				.where(eq(product.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ProductInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(product)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw new Error("Record was not created");
			return record;
		},
		async update(key: ProductKey, input: ProductInput) {
			const [record] = await db
				.update(product)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(product.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ProductKey): Promise<void> {
			await db.delete(product).where(eq(product.id, key.id));
		},
	};
}
