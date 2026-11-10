import { AppError, idSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	newAccountSchema,
	passwordSchema,
	permissionSchema,
	updateAccountSchema,
} from "../model/accounts";
import { recordAudit } from "./audit.server";
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
	.handler(async ({ data, context }) => {
		const account = await identity.createAccount(data);
		await recordAudit(context.actor, {
			action: "account.create",
			entity: "account",
			entityId: account.id,
			summary: account.name,
		});
		return account;
	});
export const updateAccount = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(updateAccountSchema)
	.handler(async ({ data, context }) => {
		if (data.id === context.actor.id && !data.enabled)
			throw new AppError("forbidden", "Cannot disable your own account");
		const account = await identity.updateAccount(data.id, data);
		await recordAudit(context.actor, {
			action: "account.update",
			entity: "account",
			entityId: account.id,
			summary: data.enabled ? "enabled" : "disabled",
		});
		return account;
	});
export const deleteAccount = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(idSchema)
	.handler(async ({ data, context }) => {
		if (data === context.actor.id)
			throw new AppError("forbidden", "Cannot delete your own account");
		await identity.deleteAccount(data);
		await recordAudit(context.actor, {
			action: "account.delete",
			entity: "account",
			entityId: data,
		});
	});
export const changePassword = createServerFn({ method: "POST" })
	.middleware([studioAuthorization()])
	.validator(z.object({ id: idSchema, password: passwordSchema }))
	.handler(async ({ data, context }) => {
		await identity.changePassword(data.id, data.password);
		await recordAudit(context.actor, {
			action: "account.password",
			entity: "account",
			entityId: data.id,
		});
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
		await recordAudit(context.actor, {
			action: data.granted ? "permission.grant" : "permission.revoke",
			entity: "account",
			entityId: data.id,
			summary: data.permission,
		});
	});
