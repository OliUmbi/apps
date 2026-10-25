import { pageSchema, timestampSchema } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/zelglihof-data/content/errors";
import {
	inquiryInputSchema,
	inquiryKeySchema,
} from "@oliumbi/zelglihof-data/content/inquiry";
import { createInquiryRepository } from "@oliumbi/zelglihof-data/content/inquiry.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listInquiries = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createInquiryRepository(database.db).list(data);
	});

export const getInquiry = createServerFn({ method: "GET" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createInquiryRepository(database.db).get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({
			key: inquiryKeySchema,
			values: inquiryInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		try {
			return await createInquiryRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw error;
		}
	});

export const deleteInquiry = createServerFn({ method: "POST" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createInquiryRepository(database.db).delete(data);
	});
