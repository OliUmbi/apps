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
import { recordAudit } from "./audit.server";
import { database } from "./database.server";
import { studioAuthorization } from "./studio-authorization";

const options = () => ({
	publicUrl: process.env.ZELGLIHOF_PUBLIC_URL ?? "http://localhost:8003",
	sender:
		process.env.ZELGLIHOF_NEWSLETTER_EMAIL ??
		"newsletter@zelglihof-maegenwil.ch",
	replyTo: process.env.ZELGLIHOF_REQUESTS_EMAIL ?? "hof@zelglihof-maegenwil.ch",
});
export const sendCampaign = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(z.object({ id: idSchema, updatedAt: timestampSchema }))
	.handler(async ({ data, context }) => {
		// One boundary: typed outcomes (queued / stale-draft) leave as clean
		// values, failures as the typed model's clean messages.
		return mapErrors(async () => {
			const result = await createCampaignService(database, options()).send(
				data.id,
				data.updatedAt,
			);
			if (result.outcome === "queued")
				await recordAudit(context.actor, {
					site: "zelglihof",
					action: "campaign.send",
					entity: "campaign",
					entityId: data.id,
					summary: `${result.count} recipients`,
				});
			return result;
		});
	});
export const requestSubscriberConfirmation = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(z.object({ email: emailSchema }))
	.handler(async ({ data }) => {
		return mapErrors(async () => {
			return createNewsletterService(database, options()).request(data.email);
		});
	});
export const unsubscribeSubscriber = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data, context }) => {
		return mapErrors(async () => {
			await createSubscriberService(database, options()).unsubscribe(data.id);
			await recordAudit(context.actor, {
				site: "zelglihof",
				action: "subscriber.unsubscribe",
				entity: "subscriber",
				entityId: data.id,
			});
		});
	});
export const correctSubscriberEmail = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(z.object({ id: idSchema, email: emailSchema }))
	.handler(async ({ data, context }) => {
		// Typed outcome as a clean value: { outcome: "corrected" | "conflict" }.
		return mapErrors(async () => {
			const result = await createSubscriberService(
				database,
				options(),
			).correctEmail(data.id, data.email);
			if (result.outcome === "corrected")
				await recordAudit(context.actor, {
					site: "zelglihof",
					action: "subscriber.correct-email",
					entity: "subscriber",
					entityId: data.id,
				});
			return result;
		});
	});
