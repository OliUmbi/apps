import type { PageInput } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import {
	type ShowcaseImageInput,
	type ShowcaseImageKey,
	showcaseImageSchema,
} from "./showcase-image";

export function createShowcaseImageRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "unclet.showcase_image",
		selection: sql`showcase_id AS "showcaseId", image_id AS "imageId", description, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: showcaseImageSchema,
		keyColumns: (key: ShowcaseImageKey) => ({
			showcase_id: key.showcaseId,
			image_id: key.imageId,
		}),
		orderColumns: ["showcase_id", "image_id"],
		searchColumn: "description",
		writeColumns: (input: ShowcaseImageInput) => ({
			showcase_id: input.showcaseId,
			image_id: input.imageId,
			description: input.description,
		}),
	});
	return {
		...repository,
		listForShowcase(input: PageInput, showcaseId: string) {
			return repository.list(input, { showcase_id: showcaseId });
		},
	};
}
