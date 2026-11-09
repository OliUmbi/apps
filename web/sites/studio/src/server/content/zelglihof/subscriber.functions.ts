import { pageSchema } from "@oliumbi/contracts";
import { subscriberKeySchema } from "@oliumbi/zelglihof-data/content/subscriber";
import { createSubscriberRepository } from "@oliumbi/zelglihof-data/content/subscriber.repository";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listSubscribers = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createSubscriberRepository(database.db).list(data);
	});

export const getSubscriber = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		return createSubscriberRepository(database.db).get(data);
	});

export const deleteSubscriber = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		await createSubscriberRepository(database.db).delete(data);
	});
