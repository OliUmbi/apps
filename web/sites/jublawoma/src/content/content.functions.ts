import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	publishedEvent,
	publishedEvents,
	publishedStories,
	publishedStory,
} from "./content.server";

export const getEvents = createServerFn({ method: "GET" }).handler(
	publishedEvents,
);
export const getStories = createServerFn({ method: "GET" }).handler(
	publishedStories,
);
export const getEvent = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string().min(1).max(160) }))
	.handler(({ data }) => publishedEvent(data.slug));
export const getStory = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string().min(1).max(160) }))
	.handler(({ data }) => publishedStory(data.slug));
