import { z } from "zod";
export const messageSchema = z.object({
	id: z.uuid(),
	queueId: z.uuid(),
	site: z.string(),
	type: z.string(),
	recipient: z.string(),
	subject: z.string(),
	status: z.string(),
	attemptCount: z.number(),
	availableAt: z.string().nullable(),
	requestedAt: z.string(),
	finishedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export const attemptSchema = z.object({
	attemptNumber: z.number(),
	outcome: z.string().nullable(),
	detail: z.object({ code: z.string(), message: z.string() }).nullable(),
	startedAt: z.string(),
	finishedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
