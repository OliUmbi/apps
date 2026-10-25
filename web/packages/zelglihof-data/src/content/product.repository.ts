import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { product } from "../schema";
import { updateMissError } from "./errors";
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
		async update(
			key: ProductKey,
			input: ProductInput,
			expectedUpdatedAt: string,
		) {
			const [record] = await db
				.update(product)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(product.id, key.id), eq(product.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.product",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ProductKey): Promise<void> {
			await db.delete(product).where(eq(product.id, key.id));
		},
	};
}
