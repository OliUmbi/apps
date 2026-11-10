import { ServiceError } from "@oliumbi/http-client";

/*
 * The session boundary in one place: the cookie contract and the one error
 * class that means "this session is gone, clear it". Pure functions so the
 * security-relevant serialization is testable without a request context.
 */

export const COOKIE_NAME = "studio_session";
// The __Host- prefix forces Secure, Path=/ and no Domain, so a sibling origin
// cannot overwrite the cookie.
export const SECURE_COOKIE_NAME = "__Host-studio_session";

export function sessionCookieName(secure: boolean) {
	return secure ? SECURE_COOKIE_NAME : COOKIE_NAME;
}

export function sessionCookieHeader(
	secure: boolean,
	value: string,
	expires: Date,
) {
	return [
		`${sessionCookieName(secure)}=${encodeURIComponent(value)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Expires=${expires.toUTCString()}`,
		secure ? "Secure" : null,
	]
		.filter((part) => part !== null)
		.join("; ");
}

export function readSessionToken(
	cookieHeader: string | null,
	secure: boolean,
): string | null {
	if (!cookieHeader) return null;
	const name = sessionCookieName(secure);
	const match = cookieHeader
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	if (!match) return null;
	try {
		const value = decodeURIComponent(match.slice(name.length + 1));
		return value === "" ? null : value;
	} catch {
		// A malformed percent sequence is not a session; never throw from the
		// request boundary.
		return null;
	}
}

// 401/404 mean the token no longer identifies a session. Anything else is an
// outage: the cookie must survive so a service restart does not sign users out.
export function isInvalidSession(error: unknown): boolean {
	return (
		error instanceof ServiceError &&
		(error.status === 401 || error.status === 404)
	);
}
