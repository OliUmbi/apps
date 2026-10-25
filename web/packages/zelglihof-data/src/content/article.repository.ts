import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { article } from "../schema";
import type { ArticleInput, ArticleKey } from "./article";
import { updateMissError } from "./errors";

export function createArticleRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select()
					.from(article)
					.where(
						input.search
							? ilike(article.title, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(article.createdAt), article.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: ArticleKey) {
			const [record] = await db
				.select()
				.from(article)
				.where(eq(article.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async create(input: ArticleInput) {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(article)
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
			key: ArticleKey,
			input: ArticleInput,
			expectedUpdatedAt: string,
		) {
			const [record] = await db
				.update(article)
				.set({
					...input,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(article.id, key.id), eq(article.updatedAt, expectedUpdatedAt)),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.article",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ArticleKey): Promise<void> {
			await db.delete(article).where(eq(article.id, key.id));
		},
	};
}
