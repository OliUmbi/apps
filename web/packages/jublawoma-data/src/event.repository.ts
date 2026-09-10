import type { ResourceRecord } from "@oliumbi/contracts";
import type { Database } from "@oliumbi/database";

export function createEventRepository(sql: Database) {
	return {
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
