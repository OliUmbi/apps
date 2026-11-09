import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/unclet-data/content/errors";
import {
	inquiryInputSchema,
	inquiryKeySchema,
} from "@oliumbi/unclet-data/content/inquiry";
import { createInquiryRepository } from "@oliumbi/unclet-data/content/inquiry.repository";
import { z } from "zod";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listInquiries = createServerFn({ method: "GET" }).middleware([studioAuthorization("unclet")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).list(data);
	});

export const getInquiry = createServerFn({ method: "GET" }).middleware([studioAuthorization("unclet")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" }).middleware([studioAuthorization("unclet")])
	.validator(
		z.strictObject({
			key: inquiryKeySchema,
			values: inquiryInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await createInquiryRepository(database.db).update(
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

export const deleteInquiry = createServerFn({ method: "POST" }).middleware([studioAuthorization("unclet")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await createInquiryRepository(database.db).delete(data);
	});
