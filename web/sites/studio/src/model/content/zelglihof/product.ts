import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import {
	auditColumns,
	bodySchema,
	databaseTimestampSchema,
	timestampRangeIsValid,
	timestampSchema,
	titleSchema,
} from "../validation";

export const productKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductKey = z.infer<typeof productKeySchema>;

export const productSchema = z.object({
	id: idSchema,
	name: titleSchema,
	description: bodySchema,
	body: bodySchema,
	imageId: idSchema.nullable(),
	visible: z.boolean(),
	reservable: z.boolean(),
	startsAt: databaseTimestampSchema.nullable(),
	endsAt: databaseTimestampSchema.nullable(),
	...auditColumns,
});
export type Product = z.infer<typeof productSchema>;

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
