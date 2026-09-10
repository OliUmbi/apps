import {
	accountSchema,
	actorSchema,
	permissionSchema,
	sessionSchema,
} from "./schemas";

export type * from "./types";

import { createHttpClient, type ServiceOptions } from "@oliumbi/http-client";
import { z } from "zod";

export function createIdentityClient(options: Omit<ServiceOptions, "name">) {
	const http = createHttpClient({ ...options, name: "Identity" });
	const post = (body: unknown): RequestInit => ({
		method: "POST",
		body: JSON.stringify(body),
	});
	return {
		createSession: (name: string, password: string) =>
			http.json("/session", sessionSchema, post({ name, password })),
		validateSession: (token: string) =>
			http.json("/session/validate", actorSchema, post({ token })),
		revokeSession: (token: string) =>
			http.empty("/session/revoke", post({ token })),
		listAccounts: () => http.json("/account", z.array(accountSchema)),
		getAccount: (id: string) =>
			http.json(
				`/account/${encodeURIComponent(id)}`,
				z.object({
					account: accountSchema,
					permissions: z.array(permissionSchema),
				}),
			),
		createAccount: (input: { name: string; email: string; password: string }) =>
			http.json("/account", accountSchema, post(input)),
		updateAccount: (
			id: string,
			input: {
				name: string;
				email: string;
				enabled: boolean;
			},
		) =>
			http.json(`/account/${encodeURIComponent(id)}`, accountSchema, {
				method: "PUT",
				body: JSON.stringify(input),
			}),
		deleteAccount: (id: string) =>
			http.empty(`/account/${encodeURIComponent(id)}`, { method: "DELETE" }),
		changePassword: (id: string, password: string) =>
			http.empty(`/account/${encodeURIComponent(id)}/password`, {
				method: "PUT",
				body: JSON.stringify({ password }),
			}),
		grantPermission: (id: string, permission: string) =>
			http.empty(`/account/${encodeURIComponent(id)}/permission`, {
				method: "PUT",
				body: JSON.stringify({ permission }),
			}),
		revokePermission: (id: string, permission: string) =>
			http.empty(`/account/${encodeURIComponent(id)}/permission`, {
				method: "DELETE",
				body: JSON.stringify({ permission }),
			}),
	};
}
