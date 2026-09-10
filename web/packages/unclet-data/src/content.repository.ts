import type { Database } from "@oliumbi/database";
import { createPublicRepository } from "@oliumbi/database/public.repository";
import { getResource, type ResourceId } from "./catalog";

const relations = {
	"unclet.showcase": { table: "unclet.showcase_image", column: "showcase_id" },
};
export function createContentRepository(sql: Database) {
	const repository = createPublicRepository(sql, relations);
	return {
		list: (id: ResourceId, page = 0) => repository.list(getResource(id), page),
		detail: (id: ResourceId, value: string, bySlug = false) =>
			repository.detail(getResource(id), value, bySlug),
	};
}
