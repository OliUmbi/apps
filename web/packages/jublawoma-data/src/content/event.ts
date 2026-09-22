import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	databaseDateSchema,
	dateRangeIsValid,
	dateSchema,
	optionalBodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const eventKeySchema = z.strictObject({
	id: idSchema,
});
export type EventKey = z.infer<typeof eventKeySchema>;

export const eventSchema = z.object({
	id: idSchema,
	name: z.string(),
	description: z.string().nullable(),
	location: z.string(),
	imageId: idSchema.nullable(),
	startsOn: databaseDateSchema,
	endsOn: databaseDateSchema,
	...auditColumns,
});
export type Event = z.infer<typeof eventSchema>;

export const eventInputSchema = z
	.strictObject({
		name: titleSchema,
		description: optionalBodySchema,
		location: titleSchema,
		imageId: idSchema.nullable(),
		startsOn: dateSchema,
		endsOn: dateSchema,
	})
	.refine(dateRangeIsValid, {
		path: ["endsOn"],
		message: "End must follow start",
	});
export type EventInput = z.infer<typeof eventInputSchema>;

export function newEventInput(): EventInput {
	return {
		name: "",
		description: null,
		location: "",
		imageId: null,
		startsOn: "",
		endsOn: "",
	};
}

export function eventInputFromRecord(record: Event): EventInput {
	return {
		name: record.name,
		description: record.description,
		location: record.location,
		imageId: record.imageId,
		startsOn: record.startsOn,
		endsOn: record.endsOn,
	};
}
