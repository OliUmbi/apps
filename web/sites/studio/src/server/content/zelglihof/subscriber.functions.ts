import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { subscriberKeySchema } from "../../../model/content/zelglihof/subscriber";
import { requireActor } from "../../auth.server";
import { subscriberStore } from "./subscriber.server";

export const listSubscribers = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return subscriberStore().list(data);
	});

export const getSubscriber = createServerFn({ method: "GET" })
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return subscriberStore().get(data);
	});

export const deleteSubscriber = createServerFn({ method: "POST" })
	.validator(subscriberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await subscriberStore().delete(data);
	});
