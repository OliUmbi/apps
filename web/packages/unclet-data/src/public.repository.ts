import type { Database } from "@oliumbi/database";
import { createPublicRepository as createDatabasePublicRepository } from "@oliumbi/database/public.repository";
import { getResource, type ResourceId } from "./catalog";

const relations = {
	"unclet.showcase": { table: "unclet.showcase_image", column: "showcase_id" },
};
export function createPublicRepository(sql: Database) {
	const repository = createDatabasePublicRepository(sql, relations);
	return {
		list: (id: ResourceId, page = 0) => repository.list(getResource(id), page),
		detail: (id: ResourceId, value: string, bySlug = false) =>
			repository.detail(getResource(id), value, bySlug),
	};
}
