import type { Database, Transaction } from "@oliumbi/database";
import {
	type SubscriberKey,
	subscriberSchema,
} from "../../../model/content/zelglihof/subscriber";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function subscriberStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "zelglihof.subscriber",
		selection: sql`id, email, status, requested_at AS "requestedAt", confirmed_at AS "confirmedAt", unsubscribed_at AS "unsubscribedAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: subscriberSchema,
		keyColumns: (key: SubscriberKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "email",
		writeColumns: (_input: never) => ({}),
	});
}
