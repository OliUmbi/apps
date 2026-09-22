import type { Database, Transaction } from "@oliumbi/database";
import {
	type MemberInput,
	type MemberKey,
	memberSchema,
} from "../../../model/content/jublawoma/member";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function memberStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
