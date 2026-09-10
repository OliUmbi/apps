import { emailSchema, idSchema } from "@oliumbi/contracts";
import { createCampaignService } from "@oliumbi/zelglihof-data/campaign.service";
import { createNewsletterService } from "@oliumbi/zelglihof-data/newsletter.service";
import { createSubscriberService } from "@oliumbi/zelglihof-data/subscriber.service";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "./auth.server";
import { database } from "./database.server";

const options = () => ({
	publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
	sender: process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
});
export const sendCampaign = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createCampaignService(database, options()).send(data.id);
	});
export const requestSubscriberConfirmation = createServerFn({ method: "POST" })
	.validator(z.object({ email: emailSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createNewsletterService(database, options()).request(data.email);
	});
export const unsubscribeSubscriber = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createSubscriberService(database, options()).unsubscribe(data.id);
	});
export const correctSubscriberEmail = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema, email: emailSchema }))
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createSubscriberService(database, options()).correctEmail(
			data.id,
			data.email,
		);
	});
