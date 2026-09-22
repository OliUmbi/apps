import { pageSchema } from "@oliumbi/contracts";
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
		return createInquiryRepository(database.sql).list(data);
	});

export const getInquiry = createServerFn({ method: "GET" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createInquiryRepository(database.sql).get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: inquiryKeySchema, values: inquiryInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		return createInquiryRepository(database.sql).update(data.key, data.values);
	});

export const deleteInquiry = createServerFn({ method: "POST" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("zelglihof");
		await createInquiryRepository(database.sql).delete(data);
	});
