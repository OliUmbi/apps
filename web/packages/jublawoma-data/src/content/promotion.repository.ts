import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { promotion } from "../schema";
import type { Promotion, PromotionInput, PromotionKey } from "./promotion";

export function createPromotionRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		Promotion,
		PromotionKey,
		PromotionInput
	>(db, {
		table: promotion,
		name: "jublawoma.promotion",
		key: { id: promotion.id },
		search: promotion.title,
		createdAt: promotion.createdAt,
		updatedAt: promotion.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
