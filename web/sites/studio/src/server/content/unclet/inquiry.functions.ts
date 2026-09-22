import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	inquiryInputSchema,
	inquiryKeySchema,
} from "../../../model/content/unclet/inquiry";
import { requireActor } from "../../auth.server";
import { inquiryStore } from "./inquiry.server";

export const listInquiries = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return inquiryStore().list(data);
	});

export const getInquiry = createServerFn({ method: "GET" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return inquiryStore().get(data);
	});

export const updateInquiry = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: inquiryKeySchema, values: inquiryInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		return inquiryStore().update(data.key, data.values);
	});

export const deleteInquiry = createServerFn({ method: "POST" })
	.validator(inquiryKeySchema)
	.handler(async ({ data }) => {
		await requireActor("unclet");
		await inquiryStore().delete(data);
	});
