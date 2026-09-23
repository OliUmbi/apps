import { idSchema } from "@oliumbi/contracts";
import {
	dateRangeIsValid,
	dateSchema,
	optionalBodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { event } from "../schema";

export const eventKeySchema = z.strictObject({
	id: idSchema,
});
export type EventKey = z.infer<typeof eventKeySchema>;

export type Event = typeof event.$inferSelect;

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
