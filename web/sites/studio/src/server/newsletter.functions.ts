import {
	emailSchema,
	idSchema,
	mapErrors,
	timestampSchema,
} from "@oliumbi/contracts";
import { createCampaignService } from "@oliumbi/zelglihof-data/campaign.service";
import { createNewsletterService } from "@oliumbi/zelglihof-data/newsletter.service";
import { createSubscriberService } from "@oliumbi/zelglihof-data/subscriber.service";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "./auth.server";
import { database } from "./database.server";

const options = () => ({
	publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
	sender: process.env.ZELGLIHOF_NEWSLETTER_EMAIL ?? "newsletter@zelglihof.ch",
	replyTo: process.env.ZELGLIHOF_REQUESTS_EMAIL ?? "hof@zelglihof.ch",
});
export const sendCampaign = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema, updatedAt: timestampSchema }))
	.handler(async ({ data }) => {
		// One boundary: typed outcomes (queued / stale-draft) leave as clean
		// values, failures as the typed model's clean messages.
		return mapErrors(async () => {
			await requireActor("zelglihof");
			return createCampaignService(database, options()).send(
				data.id,
				data.updatedAt,
			);
		});
	});
export const requestSubscriberConfirmation = createServerFn({ method: "POST" })
	.validator(z.object({ email: emailSchema }))
	.handler(async ({ data }) => {
		return mapErrors(async () => {
			await requireActor("zelglihof");
			return createNewsletterService(database, options()).request(data.email);
		});
	});
export const unsubscribeSubscriber = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data }) => {
		return mapErrors(async () => {
			await requireActor("zelglihof");
			return createSubscriberService(database, options()).unsubscribe(data.id);
		});
	});
export const correctSubscriberEmail = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema, email: emailSchema }))
	.handler(async ({ data }) => {
		// Typed outcome as a clean value: { outcome: "corrected" | "conflict" }.
		return mapErrors(async () => {
			await requireActor("zelglihof");
			return createSubscriberService(database, options()).correctEmail(
				data.id,
				data.email,
			);
		});
	});
