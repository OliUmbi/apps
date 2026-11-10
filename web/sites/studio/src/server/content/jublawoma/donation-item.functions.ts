import {
	idSchema,
	pageSchema,
	timestampSchema,
	toAppError,
} from "@oliumbi/contracts";
import {
	donationItemInputSchema,
	donationItemKeySchema,
} from "@oliumbi/jublawoma-data/content/donation-item";
import { createDonationItemRepository } from "@oliumbi/jublawoma-data/content/donation-item.repository";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listDonationItems = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema.extend({ donationId: idSchema }))
	.handler(async ({ data }) => {
		return createDonationItemRepository(database.db).listForDonation(
			data,
			data.donationId,
		);
	});

export const getDonationItem = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		return createDonationItemRepository(database.db).get(data);
	});

export const createDonationItem = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(donationItemInputSchema)
	.handler(async ({ data }) => {
		return createDonationItemRepository(database.db).create(data);
	});

export const updateDonationItem = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: donationItemKeySchema,
			values: donationItemInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await createDonationItemRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteDonationItem = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(donationItemKeySchema)
	.handler(async ({ data }) => {
		await createDonationItemRepository(database.db).delete(data);
	});
