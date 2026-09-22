import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	donationInputSchema,
	donationKeySchema,
} from "../../../model/content/jublawoma/donation";
import { requireActor } from "../../auth.server";
import { donationStore } from "./donation.server";

export const listDonations = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationStore().list(data);
	});

export const getDonation = createServerFn({ method: "GET" })
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationStore().get(data);
	});

export const createDonation = createServerFn({ method: "POST" })
	.validator(donationInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationStore().create(data);
	});

export const updateDonation = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: donationKeySchema, values: donationInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationStore().update(data.key, data.values);
	});

export const deleteDonation = createServerFn({ method: "POST" })
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await donationStore().delete(data);
	});
