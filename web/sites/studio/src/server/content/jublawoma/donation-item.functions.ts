import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	donationItemInputSchema,
	donationItemKeySchema,
} from "../../../model/content/jublawoma/donation-item";
import { requireActor } from "../../auth.server";
import { donationItemStore } from "./donation-item.server";

export const listDonationItems = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ donationId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationItemStore().list(data, { donation_id: data.donationId });
	});

export const getDonationItem = createServerFn({ method: "GET" })
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationItemStore().get(data);
	});

export const createDonationItem = createServerFn({ method: "POST" })
	.validator(donationItemInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationItemStore().create(data);
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
		return donationItemStore().update(data.key, data.values);
	});

export const deleteDonationItem = createServerFn({ method: "POST" })
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await donationItemStore().delete(data);
	});
