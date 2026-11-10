import { createServerFn } from "@tanstack/react-start";
import { profilePasswordSchema, profileSchema } from "../model/profile";
import { clearSessionCookie } from "./auth.server";
import { identity } from "./identity.server";
import { authenticatedAuthorization } from "./studio-authorization";

export const getProfile = createServerFn({ method: "GET" })
	.middleware([authenticatedAuthorization()])
	.handler(async ({ context }) => {
		return identity.getAccount(context.actor.id);
	});

export const updateProfile = createServerFn({ method: "POST" })
	.middleware([authenticatedAuthorization()])
	.validator(profileSchema)
	.handler(async ({ data, context }) => {
		return identity.updateProfile(context.actor.id, data);
	});

export const changeProfilePassword = createServerFn({ method: "POST" })
	.middleware([authenticatedAuthorization()])
	.validator(profilePasswordSchema)
	.handler(async ({ data, context }) => {
		await identity.changePassword(context.actor.id, data.password);
		clearSessionCookie();
	});
