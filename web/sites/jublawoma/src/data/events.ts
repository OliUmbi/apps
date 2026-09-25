import { pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { Event } from "@oliumbi/jublawoma-data/content/event";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PublicEvent } from "../model/content";
import { database } from "../server/database.server";
import { imageFromId } from "./images";

function eventFromRecord(record: Event): PublicEvent {
	return {
		id: record.id,
		title: record.name,
		description: record.description ?? "",
		startsOn: record.startsOn,
		endsOn: record.endsOn,
		location: record.location,
		image: record.imageId ? imageFromId(record.imageId, record.name) : null,
	};
}
export const getNextEvent = createServerFn({ method: "GET" }).handler(
	async () => {
		const event = await createPublicRepository(database.db).nextEvent();
		return event ? eventFromRecord(event) : null;
	},
);
export const getEventPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listEvents(
			data.page,
		);
		return { ...page, items: page.items.map(eventFromRecord) };
	});
