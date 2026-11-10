import { AppError, idSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	newAccountSchema,
	passwordSchema,
	permissionSchema,
	updateAccountSchema,
} from "../model/accounts";
import { identity } from "./identity.server";
import { studioAuthorization } from "./studio-authorization";

export const listAccounts = createServerFn({ method: "GET" })
	.middleware([studioAuthorization()])
	.handler(async () => {
		return identity.listAccounts();
	});
export const getAccount = createServerFn({ method: "GET" })
	.middleware([studioAuthorization()])
	.validator(idSchema)
	.handler(async ({ data }) => {
		return identity.getAccount(data);
	});
export const createAccount = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(newAccountSchema)
	.handler(async ({ data }) => {
		return identity.createAccount(data);
	});
export const updateAccount = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(updateAccountSchema)
	.handler(async ({ data, context }) => {
		if (data.id === context.actor.id && !data.enabled)
			throw new AppError("forbidden", "Cannot disable your own account");
		return identity.updateAccount(data.id, data);
	});
export const deleteAccount = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(idSchema)
	.handler(async ({ data, context }) => {
		if (data === context.actor.id)
			throw new AppError("forbidden", "Cannot delete your own account");
		await identity.deleteAccount(data);
	});
export const changePassword = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(z.object({ id: idSchema, password: passwordSchema }))
	.handler(async ({ data }) => {
		await identity.changePassword(data.id, data.password);
	});
export const setPermission = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(
		z.object({
			id: idSchema,
			permission: permissionSchema,
			granted: z.boolean(),
		}),
	)
	.handler(async ({ data, context }) => {
		if (
			context.actor.id === data.id &&
			data.permission === "studio.admin" &&
			!data.granted
		)
			throw new AppError(
				"forbidden",
				"Cannot remove your own administrator permission",
			);
		if (data.granted) await identity.grantPermission(data.id, data.permission);
		else await identity.revokePermission(data.id, data.permission);
	});
