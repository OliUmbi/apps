import { pageSchema } from "@oliumbi/contracts";
import {
	donationInputSchema,
	donationKeySchema,
} from "@oliumbi/jublawoma-data/content/donation";
import { createDonationRepository } from "@oliumbi/jublawoma-data/content/donation.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listDonations = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationRepository(database.sql).list(data);
	});

export const getDonation = createServerFn({ method: "GET" })
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationRepository(database.sql).get(data);
	});

export const createDonation = createServerFn({ method: "POST" })
	.validator(donationInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationRepository(database.sql).create(data);
	});

export const updateDonation = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: donationKeySchema, values: donationInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationRepository(database.sql).update(data.key, data.values);
	});

export const deleteDonation = createServerFn({ method: "POST" })
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createDonationRepository(database.sql).delete(data);
	});
