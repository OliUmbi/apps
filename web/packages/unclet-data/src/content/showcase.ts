import { idSchema, slugSchema } from "@oliumbi/contracts";
import {
	dateSchema,
	optionalBodySchema,
	publicationIsValid,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { showcase } from "../schema";

export const showcaseKeySchema = z.strictObject({
	id: idSchema,
});
export type ShowcaseKey = z.infer<typeof showcaseKeySchema>;

export type Showcase = typeof showcase.$inferSelect;

export const showcaseInputSchema = z
	.strictObject({
		slug: slugSchema,
		title: titleSchema,
		location: titleSchema,
		guestCount: z.number().int().nonnegative(),
		imageId: idSchema.nullable(),
		published: z.boolean(),
		publishedOn: dateSchema.nullable(),
		body: optionalBodySchema,
	})
	.refine(publicationIsValid, {
		path: ["publishedOn"],
		message: "A publication date is required",
	});
export type ShowcaseInput = z.infer<typeof showcaseInputSchema>;

export function newShowcaseInput(): ShowcaseInput {
	return {
		slug: "",
		title: "",
		location: "",
		guestCount: 1,
		imageId: null,
		published: false,
		publishedOn: null,
		body: null,
	};
}

export function showcaseInputFromRecord(record: Showcase): ShowcaseInput {
	return {
		slug: record.slug,
		title: record.title,
		location: record.location,
		guestCount: record.guestCount,
		imageId: record.imageId,
		published: record.published,
		publishedOn: record.publishedOn,
		body: record.body,
	};
}
