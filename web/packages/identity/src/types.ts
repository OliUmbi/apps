import type { z } from "zod";
import type { accountSchema } from "./schemas";

export type Account = z.infer<typeof accountSchema>;
