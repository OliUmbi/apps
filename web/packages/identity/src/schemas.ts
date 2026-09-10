import { z } from "zod";
export const actorSchema = z.object({ id: z.uuid(), name: z.string() });

export const sessionSchema = z.object({
	token: z.string(),
	expiresAt: z.iso.datetime(),
	actor: actorSchema,
});
export const accountSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.string(),
	enabled: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export const permissionSchema = z.object({ permission: z.string() });
