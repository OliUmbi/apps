import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	storyInputSchema,
	storyKeySchema,
} from "../../../model/content/jublawoma/story";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { storyStore } from "./story.server";

export const listStories = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return storyStore().list(data);
	});

export const getStory = createServerFn({ method: "GET" })
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return storyStore().get(data);
	});

export const createStory = createServerFn({ method: "POST" })
	.validator(storyInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return storyStore().create(data);
	});

export const updateStory = createServerFn({ method: "POST" })
	.validator(z.strictObject({ key: storyKeySchema, values: storyInputSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return storyStore().update(data.key, data.values);
	});

export const deleteStory = createServerFn({ method: "POST" })
	.validator(storyKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await storyStore().delete(data);
	});
