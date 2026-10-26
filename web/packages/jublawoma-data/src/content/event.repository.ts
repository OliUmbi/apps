import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { event } from "../schema";
import type { Event, EventInput, EventKey } from "./event";

export function createEventRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Event, EventKey, EventInput>(db, {
		table: event,
		name: "jublawoma.event",
		key: { id: event.id },
		search: event.name,
		createdAt: event.createdAt,
		updatedAt: event.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		create: store.create,
		update: store.update,
		delete: store.delete,
	});
}
