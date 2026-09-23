import { idSchema, pageSchema } from "@oliumbi/contracts";
import {
	donationItemInputSchema,
	donationItemKeySchema,
} from "@oliumbi/jublawoma-data/content/donation-item";
import { createDonationItemRepository } from "@oliumbi/jublawoma-data/content/donation-item.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listDonationItems = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ donationId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationItemRepository(database.db).listForDonation(
			data,
			data.donationId,
		);
	});

export const getDonationItem = createServerFn({ method: "GET" })
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationItemRepository(database.db).get(data);
	});

export const createDonationItem = createServerFn({ method: "POST" })
	.validator(donationItemInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationItemRepository(database.db).create(data);
	});

export const updateDonationItem = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: donationItemKeySchema,
			values: donationItemInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationItemRepository(database.db).update(
			data.key,
			data.values,
		);
	});

export const deleteDonationItem = createServerFn({ method: "POST" })
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createDonationItemRepository(database.db).delete(data);
	});
