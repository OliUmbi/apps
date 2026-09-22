import { pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	memberInputSchema,
	memberKeySchema,
} from "../../../model/content/jublawoma/member";
import { assets } from "../../assets.server";
import { requireActor } from "../../auth.server";
import { memberStore } from "./member.server";

export const listMembers = createServerFn({ method: "GET" })
	.validator(pageSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return memberStore().list(data);
	});

export const getMember = createServerFn({ method: "GET" })
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return memberStore().get(data);
	});

export const createMember = createServerFn({ method: "POST" })
	.validator(memberInputSchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return memberStore().create(data);
	});

export const updateMember = createServerFn({ method: "POST" })
	.validator(
		z.strictObject({ key: memberKeySchema, values: memberInputSchema }),
	)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		return memberStore().update(data.key, data.values);
	});

export const deleteMember = createServerFn({ method: "POST" })
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await memberStore().delete(data);
	});
