import { pageSchema } from "@oliumbi/contracts";
import {
	memberInputSchema,
	memberKeySchema,
} from "@oliumbi/jublawoma-data/content/member";
import { createMemberRepository } from "@oliumbi/jublawoma-data/content/member.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listMembers = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createMemberRepository(database.db).list(data);
	});

export const getMember = createServerFn({ method: "GET" })
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createMemberRepository(database.db).get(data);
	});

export const createMember = createServerFn({ method: "POST" })
	.validator(memberInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createMemberRepository(database.db).create(data);
	});

export const updateMember = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: memberKeySchema, values: memberInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return createMemberRepository(database.db).update(data.key, data.values);
	});

export const deleteMember = createServerFn({ method: "POST" })
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createMemberRepository(database.db).delete(data);
	});
