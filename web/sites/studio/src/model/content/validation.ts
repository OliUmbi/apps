import { limits } from "@oliumbi/contracts";
import { z } from "zod";

export const titleSchema = z.string().trim().min(1).max(limits.title);
export const bodySchema = z.string().trim().min(1).max(limits.body);
export const optionalTextSchema = z
	.string()
	.trim()
	.max(limits.title)
	.nullable();
export const optionalBodySchema = z.string().trim().max(limits.body).nullable();
export const dateSchema = z.iso.date();
export const timestampSchema = z.iso.datetime({ offset: true });
export const databaseDateSchema = z.preprocess(
	(value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
	dateSchema,
);
export const databaseTimestampSchema = z.preprocess(
	(value) => (value instanceof Date ? value.toISOString() : value),
	timestampSchema,
);
export const auditColumns = {
	createdAt: databaseTimestampSchema,
	updatedAt: databaseTimestampSchema,
};

export function publicationIsValid(value: {
	published: boolean;
	publishedOn: string | null;
}) {
	return !value.published || value.publishedOn !== null;
}

export function timestampRangeIsValid(value: {
	startsAt: string | null;
	endsAt: string | null;
}) {
	return (
		!value.startsAt ||
		!value.endsAt ||
		Date.parse(value.startsAt) <= Date.parse(value.endsAt)
	);
}

export function dateRangeIsValid(value: { startsOn: string; endsOn: string }) {
	return value.startsOn <= value.endsOn;
}
