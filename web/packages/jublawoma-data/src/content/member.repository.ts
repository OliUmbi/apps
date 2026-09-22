import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type MemberInput, type MemberKey, memberSchema } from "./member";

export function createMemberRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
		table: "jublawoma.member",
		selection: sql`id, name, image_id AS "imageId", group_name AS "groupName", leadership, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: memberSchema,
		keyColumns: (key: MemberKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: MemberInput) => ({
			name: input.name,
			image_id: input.imageId,
			group_name: input.groupName,
			leadership: input.leadership,
		}),
	});
}
