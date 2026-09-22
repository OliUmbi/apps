import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	eventInputSchema,
	eventKeySchema,
} from "../../../model/content/jublawoma/event";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { eventStore } from "./event.server";

export const listEvents = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return eventStore().list(data);
	});

export const getEvent = createServerFn({ method: "GET" })
	.validator(eventKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return eventStore().get(data);
	});

export const createEvent = createServerFn({ method: "POST" })
	.validator(eventInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return eventStore().create(data);
	});

export const updateEvent = createServerFn({ method: "POST" })
	.validator(z.strictObject({ key: eventKeySchema, values: eventInputSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return eventStore().update(data.key, data.values);
	});

export const deleteEvent = createServerFn({ method: "POST" })
	.validator(eventKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await eventStore().delete(data);
	});
