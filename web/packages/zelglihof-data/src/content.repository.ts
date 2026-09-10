import type { Database } from "@oliumbi/database";
import { createPublicRepository } from "@oliumbi/database/public.repository";
import { getResource, type ResourceId } from "./catalog";

const relations = {
	"zelglihof.article": {
		table: "zelglihof.article_image",
		column: "article_id",
	},
	"zelglihof.product": {
		table: "zelglihof.product_variant",
		column: "product_id",
	},
};
export function createContentRepository(sql: Database) {
	const repository = createPublicRepository(sql, relations);
	return {
		list: (id: ResourceId, page = 0) => repository.list(getResource(id), page),
		detail: (id: ResourceId, value: string, bySlug = false) =>
			repository.detail(getResource(id), value, bySlug),
	};
}
