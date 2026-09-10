import type { Database } from "@oliumbi/database";
import { createPublicRepository } from "@oliumbi/database/public.repository";
import { getResource, type ResourceId } from "./catalog";

const relations = {
	"jublawoma.story": { table: "jublawoma.story_image", column: "story_id" },
	"jublawoma.donation": {
		table: "jublawoma.donation_item",
		column: "donation_id",
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
