import { idSchema } from "@oliumbi/contracts";
import { z } from "zod";
import type { SubscriberStatus } from "../statuses";

export const subscriberKeySchema = z.strictObject({
	id: idSchema,
});
export type SubscriberKey = z.infer<typeof subscriberKeySchema>;

/*
 * The managed subscriber record as it crosses the package boundary. Written out
 * on purpose: a renamed storage column must not silently change this shape.
 * The confirmation hash and the unsubscribe token never cross it; the studio
 * repository selects exactly these columns.
 */
export interface Subscriber {
	id: string;
	email: string;
	status: SubscriberStatus;
	requestedAt: string;
	confirmedAt: string | null;
	unsubscribedAt: string | null;
	createdAt: string;
	updatedAt: string;
}
