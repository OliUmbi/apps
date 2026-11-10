import type { SiteId } from "@oliumbi/contracts";

/**
 * The pure role rule behind Studio's `requireActor`: `studio.admin` manages
 * every site, a site role only its own site, and a request without a site (the
 * cross-site overview) needs the admin role. Kept separate from the request
 * machinery so the authorization decision is testable without cookies or HTTP.
 */
export function mayManage(
	permissions: readonly string[],
	site?: SiteId,
): boolean {
	return permissions.some(
		(permission) =>
			permission === "studio.admin" ||
			(site !== undefined && permission === `${site}.manage`),
	);
}
