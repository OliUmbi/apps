import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type SubscriberKey, subscriberSchema } from "./subscriber";

export function createSubscriberRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "zelglihof.subscriber",
		selection: sql`id, email, status, requested_at AS "requestedAt", confirmed_at AS "confirmedAt", unsubscribed_at AS "unsubscribedAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: subscriberSchema,
		keyColumns: (key: SubscriberKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "email",
		writeColumns: (_input: never) => ({}),
	});
	return {
		read: repository.read,
		list: repository.list,
		get: repository.get,
		delete: repository.delete,
	};
}
