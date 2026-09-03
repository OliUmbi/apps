import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { saveEvent, saveStory } from "./content.server";

const mediaInput = z.object({
	storageKey: z.string().trim().min(1).max(1000),
	altText: z.string().trim().min(2).max(300),
	role: z.enum(["cover", "gallery"]),
	position: z.number().int().min(0),
});

const contentAction = z.discriminatedUnion("action", [
	z
		.object({
			action: z.literal("jublawoma-event-save"),
			id: z.uuid().optional(),
			slug: z
				.string()
				.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
				.max(160),
			title: z.string().trim().min(2).max(180),
			summary: z.string().trim().max(500),
			bodyMarkdown: z.string().max(20_000),
			startsOn: z.iso.date(),
			endsOn: z.iso.date(),
			location: z.string().trim().max(240),
			registrationUrl: z.union([z.literal(""), z.url().max(1000)]),
			status: z.enum(["draft", "published", "cancelled"]),
			media: z.array(mediaInput).max(30),
		})
		.refine((value) => value.endsOn >= value.startsOn, {
			message: "Das Enddatum liegt vor dem Startdatum.",
			path: ["endsOn"],
		}),
	z
		.object({
			action: z.literal("jublawoma-story-save"),
			id: z.uuid().optional(),
			slug: z
				.string()
				.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
				.max(160),
			title: z.string().trim().min(2).max(180),
			summary: z.string().trim().max(500),
			bodyMarkdown: z.string().max(30_000),
			publishedOn: z.union([z.literal(""), z.iso.date()]),
			status: z.enum(["draft", "published"]),
			media: z.array(mediaInput).max(50),
		})
		.refine((value) => value.status !== "published" || value.publishedOn, {
			message: "Ein Veröffentlichungsdatum ist erforderlich.",
			path: ["publishedOn"],
		}),
]);

export const saveJublawomaContent = createServerFn({ method: "POST" })
	.validator(contentAction)
	.handler(async ({ data }) => {
		if (data.action === "jublawoma-event-save") await saveEvent(data);
		else await saveStory(data);
		return { success: true };
	});
