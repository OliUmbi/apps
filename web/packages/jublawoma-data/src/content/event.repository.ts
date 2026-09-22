import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type EventInput, type EventKey, eventSchema } from "./event";

export function createEventRepository(sql: SqlExecutor) {
	return createContentRepository(sql, {
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
