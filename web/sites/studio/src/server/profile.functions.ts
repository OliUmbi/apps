import { createServerFn } from "@tanstack/react-start";
import { profilePasswordSchema, profileSchema } from "../studio/profile.schema";
import { requireAuthenticatedActor } from "./auth.server";
import { identity } from "./identity.server";

export const getProfile = createServerFn({ method: "GET" }).handler(
	async () => {
		const actor = await requireAuthenticatedActor();
		return identity.getAccount(actor.id);
	},
);

export const updateProfile = createServerFn({ method: "POST" })
	.validator(profileSchema)
	.handler(async ({ data }) => {
		const actor = await requireAuthenticatedActor();
		const current = await identity.getAccount(actor.id);
		return identity.updateAccount(actor.id, {
			...data,
			enabled: current.account.enabled,
		});
	});

export const changeProfilePassword = createServerFn({ method: "POST" })
	.validator(profilePasswordSchema)
	.handler(async ({ data }) => {
		const actor = await requireAuthenticatedActor();
		await identity.changePassword(actor.id, data.password);
	});
