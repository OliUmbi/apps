import { idSchema, slugSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	databaseDateSchema,
	dateSchema,
	optionalBodySchema,
	publicationIsValid,
	titleSchema,
} from "../validation";

export const showcaseKeySchema = z.strictObject({
	id: idSchema,
});
export type ShowcaseKey = z.infer<typeof showcaseKeySchema>;

export const showcaseSchema = z.object({
	id: idSchema,
	slug: slugSchema,
	title: titleSchema,
	location: titleSchema,
	guestCount: z.number().int().nonnegative(),
	imageId: idSchema.nullable(),
	published: z.boolean(),
	publishedOn: databaseDateSchema.nullable(),
	body: optionalBodySchema,
	...auditColumns,
});
export type Showcase = z.infer<typeof showcaseSchema>;

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
