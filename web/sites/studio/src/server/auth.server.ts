import type { SiteId } from "@oliumbi/contracts";
import { ServiceError } from "@oliumbi/http-client";
import {
	getRequestHeader,
	setResponseHeader,
} from "@tanstack/react-start/server";
import { identity } from "./identity.server";

const secure = process.env.STUDIO_SECURE_COOKIES === "true";
const cookieName = secure ? "__Host-studio_session" : "studio_session";

function requestToken() {
	const cookie = (getRequestHeader("cookie") ?? "")
		.split(";")
		.find((part) => part.trim().startsWith(`${cookieName}=`));
	if (!cookie) return null;
	try {
		return decodeURIComponent(cookie.trim().slice(cookieName.length + 1));
	} catch {
		return null;
	}
}

function sessionCookie(value: string, expires: string) {
	setResponseHeader(
		"Set-Cookie",
		cookieName +
			"=" +
			encodeURIComponent(value) +
			"; Path=/; HttpOnly; SameSite=Lax; Expires=" +
			expires +
			(secure ? "; Secure" : ""),
	);
}

export function clearSessionCookie() {
	sessionCookie("", new Date(0).toUTCString());
}

export async function login(name: string, password: string) {
	const session = await identity.createSession(name, password);
	sessionCookie(session.token, new Date(session.expiresAt).toUTCString());
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
		if (error instanceof ServiceError && [401, 404].includes(error.status)) {
			clearSessionCookie();
			return null;
		}
		throw error;
	}
}

export async function requireActor(site?: SiteId) {
	const actor = await requireAuthenticatedActor();
	const allowed = actor.permissions.some(
		(value) => value === "studio.admin" || (site && value === `${site}.manage`),
	);
	if (!allowed) throw new Error("Not authorized");
	return actor;
}

export async function requireAuthenticatedActor() {
	const actor = await currentActor();
	if (!actor) throw new Error("Not authenticated");
	return actor;
}

export async function logout() {
	const token = requestToken();
	if (token) await identity.revokeSession(token);
	clearSessionCookie();
}
