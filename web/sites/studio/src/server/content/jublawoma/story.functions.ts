import { pageSchema, timestampSchema } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	storyInputSchema,
	storyKeySchema,
} from "@oliumbi/jublawoma-data/content/story";
import { createStoryRepository } from "@oliumbi/jublawoma-data/content/story.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listStories = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createStoryRepository(database.db).list(data);
	});

export const getStory = createServerFn({ method: "GET" })
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createStoryRepository(database.db).get(data);
	});

export const createStory = createServerFn({ method: "POST" })
	.validator(storyInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createStoryRepository(database.db).create(data);
	});

export const updateStory = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: storyKeySchema,
			values: storyInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		try {
			return await createStoryRepository(database.db).update(
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

export const deleteStory = createServerFn({ method: "POST" })
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createStoryRepository(database.db).delete(data);
	});
