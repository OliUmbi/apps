import type { Database, Transaction } from "@oliumbi/database";
import {
	type EventInput,
	type EventKey,
	eventSchema,
} from "../../../model/content/jublawoma/event";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function eventStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
		table: "jublawoma.event",
		selection: sql`id, name, description, location, image_id AS "imageId", starts_on AS "startsOn", ends_on AS "endsOn", created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: eventSchema,
		keyColumns: (key: EventKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: EventInput) => ({
			name: input.name,
			description: input.description,
			location: input.location,
			image_id: input.imageId,
			starts_on: input.startsOn,
			ends_on: input.endsOn,
		}),
	});
}
