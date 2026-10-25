import {
	dateRangeIsValid,
	dateSchema,
	idSchema,
	optionalBodySchema,
	titleSchema,
} from "@oliumbi/contracts";
import { z } from "zod";

export const eventKeySchema = z.strictObject({
	id: idSchema,
});
export type EventKey = z.infer<typeof eventKeySchema>;

// The managed event record as it crosses the package boundary. Written out on
// purpose: a renamed storage column must not silently change this shape.
export interface Event {
	id: string;
	name: string;
	description: string | null;
	location: string;
	imageId: string | null;
	startsOn: string;
	endsOn: string;
	createdAt: string;
	updatedAt: string;
}

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
