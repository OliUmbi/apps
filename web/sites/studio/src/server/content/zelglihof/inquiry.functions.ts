import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import {
	inquiryInputSchema,
	inquiryKeySchema,
} from "@oliumbi/zelglihof-data/content/inquiry";
import { createInquiryRepository } from "@oliumbi/zelglihof-data/content/inquiry.repository";
import { z } from "zod";
import { database } from "../../database.server";
import { createServerFn } from "@tanstack/react-start";
import { studioAuthorization } from "../../studio-authorization";

export const listInquiries = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).list(data);
	});

export const getInquiry = createServerFn({ method: "GET" }).middleware([studioAuthorization("zelglihof")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
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

export const deleteInquiry = createServerFn({ method: "POST" }).middleware([studioAuthorization("zelglihof")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await createInquiryRepository(database.db).delete(data);
	});
