import { pageSchema } from "@oliumbi/contracts";
import { subscriberKeySchema } from "@oliumbi/zelglihof-data/content/subscriber";
import { createSubscriberRepository } from "@oliumbi/zelglihof-data/content/subscriber.repository";
import { createServerFn } from "@tanstack/react-start";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listSubscribers = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createSubscriberRepository(database.sql).list(data);
	});

export const getSubscriber = createServerFn({ method: "GET" })
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createSubscriberRepository(database.sql).get(data);
	});

export const deleteSubscriber = createServerFn({ method: "POST" })
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createSubscriberRepository(database.sql).delete(data);
	});
