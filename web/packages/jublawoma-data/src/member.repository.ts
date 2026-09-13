import type { ResourceRecord } from "@oliumbi/contracts";
import type { Database } from "@oliumbi/database";

export function createMemberRepository(sql: Database) {
	return {
		leadership() {
			return sql<ResourceRecord[]>`
				SELECT id, name, image_id, group_name, leadership,
					created_at::text, updated_at::text
				FROM jublawoma.member
				WHERE leadership = true
				ORDER BY name
			`;
		},
	};
}
