import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { subscriber } from "../schema";
import type { Subscriber, SubscriberKey } from "./subscriber";

export function createSubscriberRepository(db: DatabaseExecutor) {
	const store = createContentRepository<Subscriber, SubscriberKey, never>(db, {
		table: subscriber,
		name: "zelglihof.subscriber",
		key: { id: subscriber.id },
		search: subscriber.email,
		createdAt: subscriber.createdAt,
		updatedAt: subscriber.updatedAt,
		// The confirmation hash and the unsubscribe token never cross the package
		// boundary; reads select exactly these columns.
		selection: {
			id: subscriber.id,
			email: subscriber.email,
			status: subscriber.status,
			requestedAt: subscriber.requestedAt,
			confirmedAt: subscriber.confirmedAt,
			unsubscribedAt: subscriber.unsubscribedAt,
			createdAt: subscriber.createdAt,
			updatedAt: subscriber.updatedAt,
		},
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		delete: store.delete,
	});
}
