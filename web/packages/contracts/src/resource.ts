import { z } from "zod";
import {
	emailSchema,
	idSchema,
	limits,
	slugSchema,
	statusSchema,
} from "./validation";

export type * from "./resource.types";

import type { ResourceDefinition, ResourceField } from "./resource.types";

function fieldSchema(field: ResourceField): z.ZodType {
	switch (field.kind) {
		case "uuid":
			return idSchema;
		case "email":
			return emailSchema;
		case "slug":
			return slugSchema;
		case "date":
			return z.iso.date();
		case "datetime-local":
			return z.iso.datetime({ offset: true });
		case "checkbox":
			return z.boolean();
		case "status":
			return statusSchema;
		case "number": {
			let schema = z
				.number()
				.min(field.min ?? 0)
				.max(field.max ?? Number.MAX_SAFE_INTEGER);
			if (field.integer) schema = schema.int();
			return schema;
		}
		default:
			return z
				.string()
				.trim()
				.min(field.nullable ? 0 : 1)
				.max(field.kind === "textarea" ? limits.body : limits.title);
	}
}
export function resourceSchema(resource: ResourceDefinition) {
	const fields = resource.fields.filter((field) => !field.readOnly);
	return z
		.object(
			Object.fromEntries(
				fields.map((field) => {
					const schema = fieldSchema(field);
					return [field.name, field.nullable ? schema.nullable() : schema];
				}),
			),
		)
		.strict()
		.superRefine((value, context) => {
			for (const [start, end] of [
				["starts_at", "ends_at"],
				["starts_on", "ends_on"],
			]) {
				if (
					value[start] &&
					value[end] &&
					Date.parse(String(value[start])) > Date.parse(String(value[end]))
				)
					context.addIssue({
						code: "custom",
						path: [end],
						message: "End must follow start",
					});
			}
			if (value.published === true && !value.published_on)
				context.addIssue({
					code: "custom",
					path: ["published_on"],
					message: "A publication date is required",
				});
		});
}
