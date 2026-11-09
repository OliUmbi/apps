import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	donationInputSchema,
	donationKeySchema,
} from "@oliumbi/jublawoma-data/content/donation";
import { createDonationRepository } from "@oliumbi/jublawoma-data/content/donation.repository";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import { z } from "zod";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listDonations = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createDonationRepository(database.db).list(data);
	});

export const getDonation = createServerFn({ method: "GET" }).middleware([studioAuthorization("jublawoma")])
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		return createDonationRepository(database.db).get(data);
	});

export const createDonation = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(donationInputSchema)
	.handler(async ({ data }) => {
		return createDonationRepository(database.db).create(data);
	});

export const updateDonation = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: donationKeySchema,
			values: donationInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await createDonationRepository(database.db).update(
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

export const deleteDonation = createServerFn({ method: "POST" }).middleware([studioAuthorization("jublawoma")])
	.validator(donationKeySchema)
	.handler(async ({ data }) => {
		await createDonationRepository(database.db).delete(data);
	});
