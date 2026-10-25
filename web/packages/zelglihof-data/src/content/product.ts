import {
	bodySchema,
	idSchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const productKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductKey = z.infer<typeof productKeySchema>;

// The managed product record as it crosses the package boundary. Written out on
// purpose: a renamed storage column must not silently change this shape.
export interface Product {
	id: string;
	name: string;
	description: string;
	body: string;
	imageId: string | null;
	visible: boolean;
	reservable: boolean;
	startsAt: string | null;
	endsAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export const productInputSchema = z
	.strictObject({
		name: titleSchema,
		description: bodySchema,
		body: bodySchema,
		imageId: idSchema.nullable(),
		visible: z.boolean(),
		reservable: z.boolean(),
		startsAt: timestampSchema.nullable(),
		endsAt: timestampSchema.nullable(),
	})
	.refine(timestampRangeIsValid, {
		path: ["endsAt"],
		message: "End must follow start",
	});
export type ProductInput = z.infer<typeof productInputSchema>;

export function newProductInput(): ProductInput {
	return {
		name: "",
		description: "",
		body: "",
		imageId: null,
		visible: false,
		reservable: false,
		startsAt: null,
		endsAt: null,
	};
}

export function productInputFromRecord(record: Product): ProductInput {
	return {
		name: record.name,
		description: record.description,
		body: record.body,
		imageId: record.imageId,
		visible: record.visible,
		reservable: record.reservable,
		startsAt: record.startsAt,
		endsAt: record.endsAt,
	};
}
