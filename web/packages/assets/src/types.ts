import type { z } from "zod";
import type { documentSchema, imageSchema } from "./schemas";
export type AssetImage = z.infer<typeof imageSchema>;
export type AssetDocument = z.infer<typeof documentSchema>;
