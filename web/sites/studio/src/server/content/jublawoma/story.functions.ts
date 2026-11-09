import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	storyInputSchema,
	storyKeySchema,
} from "@oliumbi/jublawoma-data/content/story";
import { createStoryRepository } from "@oliumbi/jublawoma-data/content/story.repository";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listStories = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createStoryRepository(database.db).list(data);
	});

export const getStory = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		return createStoryRepository(database.db).get(data);
	});

export const createStory = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(storyInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createStoryRepository(database.db).create(data);
	});

export const updateStory = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: storyKeySchema,
			values: storyInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
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
			throw toAppError(error);
		}
	});

export const deleteStory = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		await createStoryRepository(database.db).delete(data);
	});
