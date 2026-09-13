import { limits } from "@oliumbi/contracts";
import { createResourceRepository } from "@oliumbi/unclet-data";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

export const reviewSchema = z.object({
	stars: z.number().int().min(1).max(5),
	name: z.string().trim().min(2).max(limits.name),
	description: z.string().trim().min(5).max(limits.text),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const sendReview = createServerFn({ method: "POST" })
	.validator(reviewSchema)
	.handler(async ({ data }) => {
		await createResourceRepository(database.sql, "unclet.review").create({
			...data,
			visible: false,
		});
		return { outcome: "accepted" as const };
	});
