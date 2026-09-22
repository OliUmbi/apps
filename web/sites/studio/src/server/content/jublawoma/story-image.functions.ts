import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	storyImageInputSchema,
	storyImageKeySchema,
} from "../../../model/content/jublawoma/story-image";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { storyImageStore } from "./story-image.server";

export const listStoryImages = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ storyId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return storyImageStore().list(data, { story_id: data.storyId });
	});

export const getStoryImage = createServerFn({ method: "GET" })
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return storyImageStore().get(data);
	});

export const createStoryImage = createServerFn({ method: "POST" })
	.validator(storyImageInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return storyImageStore().create(data);
	});

export const updateStoryImage = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: storyImageKeySchema, values: storyImageInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return storyImageStore().update(data.key, data.values);
	});

export const deleteStoryImage = createServerFn({ method: "POST" })
	.validator(storyImageKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await storyImageStore().delete(data);
	});
