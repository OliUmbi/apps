import type { z } from "zod";
import type { accountSchema, actorSchema } from "./schemas";
export type Actor = z.infer<typeof actorSchema>;

export type Account = z.infer<typeof accountSchema>;
