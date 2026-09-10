import type { z } from "zod";
import type { messageSchema } from "./schemas";
export type Message = z.infer<typeof messageSchema>;
