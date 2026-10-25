import {
	dateSchema,
	idSchema,
	optionalBodySchema,
	publicationIsValid,
	slugSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const showcaseKeySchema = z.strictObject({
	id: idSchema,
});
export type ShowcaseKey = z.infer<typeof showcaseKeySchema>;

// The managed showcase record as it crosses the package boundary. Written out
// on purpose: a renamed storage column must not silently change this shape.
export interface Showcase {
	id: string;
	slug: string;
	title: string;
	location: string;
	guestCount: number;
	imageId: string | null;
	published: boolean;
	publishedOn: string | null;
	body: string | null;
	createdAt: string;
	updatedAt: string;
}

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
