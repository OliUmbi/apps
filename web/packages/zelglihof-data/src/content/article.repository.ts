import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { article } from "../schema";
import type { Article, ArticleInput, ArticleKey } from "./article";

export function createArticleRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Article, ArticleKey, ArticleInput>(db, {
		table: article,
		name: "zelglihof.article",
		key: { id: article.id },
		search: article.title,
		createdAt: article.createdAt,
		updatedAt: article.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
