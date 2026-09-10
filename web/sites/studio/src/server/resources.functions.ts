import {
	pageSchema,
	type ResourceRecord,
	type SiteId,
} from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resourceIds } from "../studio/resources";
import { currentActor, requireActor } from "./auth.server";
import { database } from "./database.server";
import { createResourceService } from "./resource.service";

const identity = z.object({ resource: z.enum(resourceIds) });
const record = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
const mutation = identity.extend({ key: record, values: record });
export const getSession = createServerFn({ method: "GET" }).handler(
	currentActor,
);
export const listRecords = createServerFn({ method: "GET" })
	.validator(identity.extend(pageSchema.shape))
	.handler(async ({ data }) => {
		await requireActor(data.resource.split(".")[0] as SiteId);
		return createResourceService(database.sql, data.resource).list(data);
	});
export const createRecord = createServerFn({ method: "POST" })
	.validator(identity.extend({ values: record }))
	.handler(async ({ data }) => {
		await requireActor(data.resource.split(".")[0] as SiteId);
		return createResourceService(database.sql, data.resource).create(
			data.values as ResourceRecord,
		);
	});
export const updateRecord = createServerFn({ method: "POST" })
	.validator(mutation)
	.handler(async ({ data }) => {
		await requireActor(data.resource.split(".")[0] as SiteId);
		return createResourceService(database.sql, data.resource).update(
			data.key,
			data.values,
		);
	});
export const deleteRecord = createServerFn({ method: "POST" })
	.validator(identity.extend({ key: record }))
	.handler(async ({ data }) => {
		await requireActor(data.resource.split(".")[0] as SiteId);
		await createResourceService(database.sql, data.resource).delete(data.key);
	});
