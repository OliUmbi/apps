import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { showcaseImage } from "../schema";
import type {
	ShowcaseImage,
	ShowcaseImageInput,
	ShowcaseImageKey,
} from "./showcase-image";

export function createShowcaseImageRepository(db: DatabaseExecutor) {
	const store = createContentRepository<
		ShowcaseImage,
		ShowcaseImageKey,
		ShowcaseImageInput
	>(db, {
		table: showcaseImage,
		name: "unclet.showcase_image",
		key: {
			showcaseId: showcaseImage.showcaseId,
			imageId: showcaseImage.imageId,
		},
		// The composite key is the row's identity: values that claim another
		// identity are rejected instead of re-parenting or renaming the row.
		keyIsIdentity: true,
		search: showcaseImage.description,
		createdAt: showcaseImage.createdAt,
		updatedAt: showcaseImage.updatedAt,
		scope: showcaseImage.showcaseId,
	});
	return guardRepository({
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
		listForShowcase: store.listScoped,
	});
}
