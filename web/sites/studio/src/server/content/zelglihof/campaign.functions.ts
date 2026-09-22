import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	campaignInputSchema,
	campaignKeySchema,
} from "../../../model/content/zelglihof/campaign";
import { requireActor } from "../../auth.server";
import { campaignStore } from "./campaign.server";

export const listCampaigns = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return campaignStore().list(data);
	});

export const getCampaign = createServerFn({ method: "GET" })
	.validator(campaignKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return campaignStore().get(data);
	});

export const createCampaign = createServerFn({ method: "POST" })
	.validator(campaignInputSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return campaignStore().create(data);
	});

export const updateCampaign = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: campaignKeySchema, values: campaignInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return campaignStore().update(data.key, data.values);
	});

export const deleteCampaign = createServerFn({ method: "POST" })
	.validator(campaignKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await campaignStore().delete(data);
	});
