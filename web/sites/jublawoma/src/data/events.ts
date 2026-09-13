import { type Page, pageSchema, type ResourceRecord } from "@oliumbi/contracts";
import { createEventRepository } from "@oliumbi/jublawoma-data/event.repository";
import type { EventRecord } from "@oliumbi/jublawoma-data/public.types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";
import { mediaFromRecord } from "./media";

function eventFromRecord(record: ResourceRecord): EventRecord {
	return {
		id: String(record.id),
		title: String(record.name),
		summary: record.description ? String(record.description) : "",
		startsOn: String(record.starts_on).slice(0, 10),
		endsOn: String(record.ends_on).slice(0, 10),
		location: String(record.location),
		media: mediaFromRecord(record),
	};
}

export const getNextEvent = createServerFn({ method: "GET" }).handler(
	async () => {
		const record = await createEventRepository(database.sql).next();
		return record ? eventFromRecord(record) : null;
	},
);

export const getEventPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }): Promise<Page<EventRecord>> => {
		const result = await createEventRepository(database.sql).page(data.page);
		return { ...result, items: result.items.map(eventFromRecord) };
	});
