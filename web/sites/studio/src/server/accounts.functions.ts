import { idSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	newAccountSchema,
	passwordSchema,
	permissionSchema,
	updateAccountSchema,
} from "../studio/account.schema";
import { requireActor } from "./auth.server";
import { identity } from "./identity.server";

export const listAccounts = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireActor();
		return identity.listAccounts();
	},
);
export const getAccount = createServerFn({ method: "GET" })
	.validator(idSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return identity.getAccount(data);
	});
export const createAccount = createServerFn({ method: "POST" })
	.validator(newAccountSchema)
	.handler(async ({ data }) => {
		await requireActor();
		return identity.createAccount(data);
	});
export const updateAccount = createServerFn({ method: "POST" })
	.validator(updateAccountSchema)
	.handler(async ({ data }) => {
		const actor = await requireActor();
		if (data.id === actor.id && !data.enabled)
			throw new Error("Cannot disable your own account");
		return identity.updateAccount(data.id, data);
	});
export const deleteAccount = createServerFn({ method: "POST" })
	.validator(idSchema)
	.handler(async ({ data }) => {
		const actor = await requireActor();
		if (data === actor.id) throw new Error("Cannot delete your own account");
		await identity.deleteAccount(data);
	});
export const changePassword = createServerFn({ method: "POST" })
	.validator(z.object({ id: idSchema, password: passwordSchema }))
	.handler(async ({ data }) => {
		await requireActor();
		await identity.changePassword(data.id, data.password);
	});
export const setPermission = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: idSchema,
			permission: permissionSchema,
			granted: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const actor = await requireActor();
		if (
			actor.id === data.id &&
			data.permission === "studio.admin" &&
			!data.granted
		)
			throw new Error("Cannot remove your own administrator permission");
		if (data.granted) await identity.grantPermission(data.id, data.permission);
		else await identity.revokePermission(data.id, data.permission);
	});
