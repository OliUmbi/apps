import { pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

export const getLeadership = createServerFn({ method: "GET" }).handler(() =>
	createPublicRepository(database.db).leadership(),
);
export const getMemberPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(({ data }) =>
		createPublicRepository(database.db).listMembers(data.page),
	);
