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
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listStoryImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ storyId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createStoryImageRepository(database.db).listForStory(
			data,
			data.storyId,
		);
	});

export const getStoryImage = createServerFn({ method: "GET" })
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createStoryImageRepository(database.db).get(data);
	});

export const createStoryImage = createServerFn({ method: "POST" })
	.validator(storyImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createStoryImageRepository(database.db).create(data);
	});

export const updateStoryImage = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: storyImageKeySchema,
			values: storyImageInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
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
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createStoryImageRepository(database.db).delete(data);
	});
