import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import { auditColumns, databaseTimestampSchema } from "../validation";

export const subscriberKeySchema = z.strictObject({
	id: idSchema,
});
export type SubscriberKey = z.infer<typeof subscriberKeySchema>;

export const subscriberSchema = z.object({
	id: idSchema,
	email: z.string(),
	status: z.enum(["pending", "active", "unsubscribed"]),
	requestedAt: databaseTimestampSchema,
	confirmedAt: databaseTimestampSchema.nullable(),
	unsubscribedAt: databaseTimestampSchema.nullable(),
	...auditColumns,
});
export type Subscriber = z.infer<typeof subscriberSchema>;
