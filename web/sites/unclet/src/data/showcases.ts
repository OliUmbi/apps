import { pageSchema, slugSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/unclet-data";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

export const getShowcasePage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(({ data }) =>
		createPublicRepository(database.db).listShowcases(data.page),
	);
export const getShowcase = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(({ data }) =>
		createPublicRepository(database.db).findShowcase(data.slug),
	);
