import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { showcase } from "../schema";
import type { Showcase, ShowcaseInput, ShowcaseKey } from "./showcase";

export function createShowcaseRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Showcase, ShowcaseKey, ShowcaseInput>(
		db,
		{
			table: showcase,
			name: "unclet.showcase",
			key: { id: showcase.id },
			search: showcase.title,
			createdAt: showcase.createdAt,
			updatedAt: showcase.updatedAt,
		},
	);
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
