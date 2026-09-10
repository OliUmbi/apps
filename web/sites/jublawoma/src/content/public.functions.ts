import { idSchema, pageSchema, slugSchema } from "@oliumbi/contracts";
import { createContentRepository } from "@oliumbi/jublawoma-data";
import { publicResourceIds } from "@oliumbi/jublawoma-data/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

const resource = z.enum(publicResourceIds);
export const listPublicRecords = createServerFn({ method: "GET" })
	.validator(z.object({ resource, page: pageSchema.shape.page }))
	.handler(({ data }) =>
		createContentRepository(database.sql).list(data.resource, data.page),
	);
export const getPublicRecord = createServerFn({ method: "GET" })
	.validator(
		z.object({
			resource,
			value: z.union([idSchema, slugSchema]),
			bySlug: z.boolean().default(false),
		}),
	)
	.handler(({ data }) =>
		createContentRepository(database.sql).detail(
			data.resource,
			data.value,
			data.bySlug,
		),
	);
