import {
	idSchema,
	pageSchema,
	timestampSchema,
	toAppError,
} from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	storyImageInputSchema,
	storyImageKeySchema,
} from "@oliumbi/jublawoma-data/content/story-image";
import { createStoryImageRepository } from "@oliumbi/jublawoma-data/content/story-image.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listStoryImages = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema.extend({ storyId: idSchema }))
	.handler(async ({ data }) => {
		return createStoryImageRepository(database.db).listForStory(
			data,
			data.storyId,
		);
	});

export const getStoryImage = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		return createStoryImageRepository(database.db).get(data);
	});

export const createStoryImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(storyImageInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createStoryImageRepository(database.db).create(data);
	});

export const updateStoryImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: storyImageKeySchema,
			values: storyImageInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		try {
			return await createStoryImageRepository(database.db).update(
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

export const deleteStoryImage = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		await createStoryImageRepository(database.db).delete(data);
	});
