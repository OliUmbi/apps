import {
	guardRepository,
	type Page,
	type PageInput,
	recordNotCreatedError,
} from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { articleImage } from "../schema";
import type {
	ArticleImage,
	ArticleImageInput,
	ArticleImageKey,
} from "./article-image";
import { RecordKeyMismatchError, updateMissError } from "./errors";

export function createArticleImageRepository(db: DatabaseExecutor) {
	return guardRepository({
		async get(key: ArticleImageKey): Promise<ArticleImage | null> {
			const [record] = await db
				.select()
				.from(articleImage)
				.where(
					and(
						eq(articleImage.articleId, key.articleId),
						eq(articleImage.imageId, key.imageId),
					),
				)
				.limit(1);
			return record ?? null;
		},
		async create(input: ArticleImageInput): Promise<ArticleImage> {
			const now = new Date().toISOString();
			const [record] = await db
				.insert(articleImage)
				.values({
					...input,
					createdAt: now,
					updatedAt: now,
				})
				.returning();
			if (!record) throw recordNotCreatedError();
			return record;
		},
		async update(
			key: ArticleImageKey,
			input: ArticleImageInput,
			expectedUpdatedAt: string,
		): Promise<ArticleImage> {
			// The composite key is the row's identity: it is never written on update,
			// and values that claim another identity are rejected instead of silently
			// re-parenting or renaming the row.
			if (input.articleId !== key.articleId || input.imageId !== key.imageId)
				throw new RecordKeyMismatchError("zelglihof.article_image");
			const [record] = await db
				.update(articleImage)
				.set({
					description: input.description,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(articleImage.articleId, key.articleId),
						eq(articleImage.imageId, key.imageId),
						eq(articleImage.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.article_image",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ArticleImageKey): Promise<void> {
			await db
				.delete(articleImage)
				.where(
					and(
						eq(articleImage.articleId, key.articleId),
						eq(articleImage.imageId, key.imageId),
					),
				);
		},
		listForArticle(
			input: PageInput,
			articleId: string,
		): Promise<Page<ArticleImage>> {
			return paginate<ArticleImage>(
				db
					.select()
					.from(articleImage)
					.where(
						and(
							eq(articleImage.articleId, articleId),
							input.search
								? ilike(articleImage.description, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(
						desc(articleImage.createdAt),
						articleImage.articleId,
						articleImage.imageId,
					)
					.$dynamic(),
				input,
			);
		},
	});
}
