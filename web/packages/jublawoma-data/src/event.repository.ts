import {
	type Page,
	pageResult,
	pageSchema,
	type ResourceRecord,
} from "@oliumbi/contracts";
import type { Database } from "@oliumbi/database";

export function createEventRepository(sql: Database) {
	return {
		async page(page: number): Promise<Page<ResourceRecord>> {
			const input = pageSchema.parse({ page });
			const records = await sql<ResourceRecord[]>`
				SELECT id, name, description, location, image_id,
					starts_on::text, ends_on::text, created_at::text, updated_at::text
				FROM jublawoma.event
				WHERE ends_on >= current_date
				ORDER BY starts_on, id
				LIMIT ${input.size + 1} OFFSET ${input.page * input.size}
			`;
			return pageResult(records, input);
		},
		async next() {
			const [event] = await sql<ResourceRecord[]>`
				SELECT id, name, description, location, image_id,
					starts_on::text, ends_on::text
				FROM jublawoma.event
				WHERE ends_on >= current_date
				ORDER BY starts_on, id
				LIMIT 1
			`;
			return event ?? null;
		},
	};
}
