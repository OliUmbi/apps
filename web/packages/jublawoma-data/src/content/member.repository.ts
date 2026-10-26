import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { member } from "../schema";
import type { Member, MemberInput, MemberKey } from "./member";

export function createMemberRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Member, MemberKey, MemberInput>(db, {
		table: member,
		name: "jublawoma.member",
		key: { id: member.id },
		search: member.name,
		createdAt: member.createdAt,
		updatedAt: member.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
