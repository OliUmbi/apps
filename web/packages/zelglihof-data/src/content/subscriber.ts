import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	databaseTimestampSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

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
