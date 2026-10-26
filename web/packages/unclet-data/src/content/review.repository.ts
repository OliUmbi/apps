import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { review } from "../schema";
import type { Review, ReviewInput, ReviewKey } from "./review";

export function createReviewRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Review, ReviewKey, ReviewInput>(db, {
		table: review,
		name: "unclet.review",
		key: { id: review.id },
		search: review.name,
		createdAt: review.createdAt,
		updatedAt: review.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
