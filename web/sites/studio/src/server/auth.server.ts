import { AppError, type SiteId, toAppError } from "@oliumbi/contracts";
import {
	getRequestHeader,
	setResponseHeader,
} from "@tanstack/react-start/server";
import { identity } from "./identity.server";
import { mayManage } from "./roles";
import {
	isInvalidSession,
	readSessionToken,
	sessionCookieHeader,
} from "./session";

const secure = process.env.STUDIO_SECURE_COOKIES === "true";

function requestToken() {
	return readSessionToken(getRequestHeader("cookie") ?? null, secure);
}

function sessionCookie(value: string, expires: Date) {
	setResponseHeader("Set-Cookie", sessionCookieHeader(secure, value, expires));
}

export function clearSessionCookie() {
	sessionCookie("", new Date(0));
}

export async function login(name: string, password: string) {
	const session = await identity.createSession(name, password);
	sessionCookie(session.token, new Date(session.expiresAt));
	return session.actor;
}

export async function currentActor() {
	const token = requestToken();
	if (!token) return null;
	try {
		const actor = await identity.validateSession(token);
		const { permissions } = await identity.getAccount(actor.id);
		return {
			...actor,
			displayName: actor.name,
			username: actor.name,
			permissions: permissions.map((entry) => entry.permission),
		};
	} catch (error) {
		if (isInvalidSession(error)) {
			clearSessionCookie();
			return null;
		}
		// One boundary: a failure leaves typed, never as a raw driver/HTTP error.
		throw toAppError(error);
	}
}

export async function requireActor(site?: SiteId) {
	const actor = await requireAuthenticatedActor();
	if (!mayManage(actor.permissions, site))
		throw new AppError("forbidden", "Not authorized");
	return actor;
}

export async function requireAuthenticatedActor() {
	const actor = await currentActor();
	if (!actor) throw new AppError("unauthorized", "Not authenticated");
	return actor;
}

export async function logout() {
	const token = requestToken();
	try {
		if (token) await identity.revokeSession(token);
	} catch (error) {
		if (!isInvalidSession(error)) throw toAppError(error);
	} finally {
		clearSessionCookie();
	}
}
