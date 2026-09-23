import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { subscriber } from "../schema";

export const subscriberKeySchema = z.strictObject({
	id: idSchema,
});
export type SubscriberKey = z.infer<typeof subscriberKeySchema>;

export type Subscriber = Omit<
	typeof subscriber.$inferSelect,
	"confirmationTokenHash" | "unsubscribeToken"
>;
