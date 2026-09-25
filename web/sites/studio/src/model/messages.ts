import { pageSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const messageListSchema = pageSchema.extend({
	filter: z.enum(["all", "failed"]).default("all"),
});

export type MessageFilter = z.infer<typeof messageListSchema>["filter"];
