import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { articleImage } from "../schema";
import type {
	ArticleImage,
	ArticleImageInput,
	ArticleImageKey,
} from "./article-image";

export function createArticleImageRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		ArticleImage,
		ArticleImageKey,
		ArticleImageInput
	>(db, {
		table: articleImage,
		name: "zelglihof.article_image",
		key: { articleId: articleImage.articleId, imageId: articleImage.imageId },
		// The composite key is the row's identity: values that claim another
		// identity are rejected instead of re-parenting or renaming the row.
		keyIsIdentity: true,
		search: articleImage.description,
		createdAt: articleImage.createdAt,
		updatedAt: articleImage.updatedAt,
		scope: articleImage.articleId,
	});
	return guardRepository({
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
		listForArticle: store.listScoped,
	});
}
