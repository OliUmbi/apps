import type { SiteId } from "@oliumbi/contracts";
import { createMiddleware } from "@tanstack/react-start";
import { requireActor, requireAuthenticatedActor } from "./auth.server";

/** Authorization middleware for Studio server functions. Keep createServerFn
 * visible at each endpoint so TanStack's import-protection transform can see it. */
export function studioAuthorization(
	site?: SiteId | ((data: unknown) => SiteId),
) {
	return createMiddleware({ type: "function" }).server(
		async ({ data, next }) => {
			const actor = await requireActor(
				typeof site === "function" ? site(data) : site,
			);
			return next({ context: { actor } });
		},
	);
}

/** For personal profile operations that need a valid account but no site role. */
export function authenticatedAuthorization() {
	return createMiddleware({ type: "function" }).server(async ({ next }) => {
		const actor = await requireAuthenticatedActor();
		return next({ context: { actor } });
	});
}
