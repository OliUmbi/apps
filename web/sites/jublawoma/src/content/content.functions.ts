import { idSchema, pageSchema, slugSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	eventPage,
	nextEvent,
	publishedEvent,
	publishedStories,
	publishedStory,
	storyPage,
} from "./content.server";

export const getNextEvent = createServerFn({ method: "GET" }).handler(() =>
	nextEvent(),
);
export const getStories = createServerFn({ method: "GET" }).handler(() =>
	publishedStories(),
);
export const getEvent = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(({ data }) => publishedEvent(data.id));
export const getStory = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(({ data }) => publishedStory(data.slug));

export const getEventPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(({ data }) => eventPage(data.page));
export const getStoryPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(({ data }) => storyPage(data.page));
