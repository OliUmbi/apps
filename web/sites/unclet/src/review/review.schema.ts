import { limits } from "@oliumbi/contracts";
import { z } from "zod";

export const reviewSchema = z.object({
	stars: z.number().int().min(1).max(5),
	name: z.string().trim().min(2).max(limits.name),
	description: z.string().trim().min(5).max(limits.text),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
