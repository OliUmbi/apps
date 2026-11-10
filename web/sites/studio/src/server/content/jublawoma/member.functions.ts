import { pageSchema, timestampSchema, toAppError } from "@oliumbi/contracts";
import {
	concurrentUpdateMessage,
	isConcurrentUpdateError,
} from "@oliumbi/jublawoma-data/content/errors";
import {
	memberInputSchema,
	memberKeySchema,
} from "@oliumbi/jublawoma-data/content/member";
import { createMemberRepository } from "@oliumbi/jublawoma-data/content/member.repository";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "../../assets.server";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listMembers = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema)
	.handler(async ({ data }) => {
		return createMemberRepository(database.db).list(data);
	});

export const getMember = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		return createMemberRepository(database.db).get(data);
	});

export const createMember = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(memberInputSchema)
	.handler(async ({ data }) => {
		if (data.imageId) await assets.images.get("jublawoma", data.imageId);
		return createMemberRepository(database.db).create(data);
	});

export const updateMember = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(
		z.strictObject({
			key: memberKeySchema,
			values: memberInputSchema,
			updatedAt: timestampSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (data.values.imageId)
			await assets.images.get("jublawoma", data.values.imageId);
		try {
			return await createMemberRepository(database.db).update(
				data.key,
				data.values,
				data.updatedAt,
			);
		} catch (error) {
			if (isConcurrentUpdateError(error))
				throw new Error(concurrentUpdateMessage);
			throw toAppError(error);
		}
	});

export const deleteMember = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(memberKeySchema)
	.handler(async ({ data }) => {
		await createMemberRepository(database.db).delete(data);
	});
