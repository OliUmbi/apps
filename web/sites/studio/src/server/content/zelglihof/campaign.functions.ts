import { pageSchema } from "@oliumbi/contracts";
import {
	campaignInputSchema,
	campaignKeySchema,
} from "@oliumbi/zelglihof-data/content/campaign";
import { createCampaignRepository } from "@oliumbi/zelglihof-data/content/campaign.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listCampaigns = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createCampaignRepository(database.db).list(data);
	});

export const getCampaign = createServerFn({ method: "GET" })
	.validator(campaignKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createCampaignRepository(database.db).get(data);
	});

export const createCampaign = createServerFn({ method: "POST" })
	.validator(campaignInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createCampaignRepository(database.db).create(data);
	});

export const updateCampaign = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: campaignKeySchema, values: campaignInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createCampaignRepository(database.db).update(data.key, data.values);
	});

export const deleteCampaign = createServerFn({ method: "POST" })
	.validator(campaignKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createCampaignRepository(database.db).delete(data);
	});
