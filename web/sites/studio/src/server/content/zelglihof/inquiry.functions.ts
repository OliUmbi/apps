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
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { recordAudit } from "../../audit.server";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listInquiries = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).list(data);
	});

export const getInquiry = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		return createInquiryRepository(database.db).get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(
		z.strictObject({
			key: inquiryKeySchema,
			values: inquiryInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		try {
			const record = await createInquiryRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
			await recordAudit(context.actor, {
				site: "zelglihof",
				action: "inquiry.update",
				entity: "inquiry",
				entityId: data.key.id,
				summary: data.values.status,
			});
			return record;
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteInquiry = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("zelglihof")])
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await createInquiryRepository(database.db).delete(data);
	});
