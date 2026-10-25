import { pageSchema } from "@oliumbi/contracts";
import { timestampSchema } from "@oliumbi/contracts/content-validation";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	eventInputSchema,
	eventKeySchema,
} from "@oliumbi/jublawoma-data/content/event";
import { createEventRepository } from "@oliumbi/jublawoma-data/content/event.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listEvents = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createEventRepository(database.db).list(data);
	});

export const getEvent = createServerFn({ method: "GET" })
	.validator(eventKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createEventRepository(database.db).get(data);
	});

export const createEvent = createServerFn({ method: "POST" })
	.validator(eventInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createEventRepository(database.db).create(data);
	});

export const updateEvent = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: eventKeySchema,
			values: eventInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		try {
			return await createEventRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw error;
		}
	});

export const deleteEvent = createServerFn({ method: "POST" })
	.validator(eventKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createEventRepository(database.db).delete(data);
	});
