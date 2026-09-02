import {
	getRequestHeader,
	setResponseHeader,
} from "@tanstack/react-start/server";

export interface Actor {
	id: string;
	username: string;
	displayName: string;
}

const secureCookies = process.env.STUDIO_SECURE_COOKIES === "true";
const cookieName = secureCookies ? "__Host-studio_session" : "studio_session";

function identityUrl(path: string): string {
	return new URL(
		path,
		process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8081",
	).toString();
}

function internalHeaders(): Record<string, string> {
	const token = process.env.IDENTITY_INTERNAL_TOKEN;
	if (!token) throw new Error("IDENTITY_INTERNAL_TOKEN is not configured");
	return { "X-Internal-Token": token, "Content-Type": "application/json" };
}

function requestToken(): string | null {
	const cookie = getRequestHeader("cookie") ?? "";
	for (const part of cookie.split(";")) {
		const [name, ...value] = part.trim().split("=");
		if (name === cookieName) return decodeURIComponent(value.join("="));
	}
	return null;
}

function setSessionCookie(token: string, expiresAt: string) {
	const secure = secureCookies ? "; Secure" : "";
	setResponseHeader(
		"Set-Cookie",
		`${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}${secure}`,
	);
}

export function clearSessionCookie() {
	const secure = secureCookies ? "; Secure" : "";
	setResponseHeader(
		"Set-Cookie",
		`${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
	);
}

export async function login(
	username: string,
	password: string,
): Promise<Actor> {
	const response = await fetch(identityUrl("/internal/sessions"), {
		method: "POST",
		headers: internalHeaders(),
		body: JSON.stringify({ username, password }),
	});
	if (!response.ok) throw new Error("Benutzername oder Passwort ist falsch.");
	const session = (await response.json()) as {
		token: string;
		expiresAt: string;
		actor: Actor;
	};
	setSessionCookie(session.token, session.expiresAt);
	return session.actor;
}

export async function currentActor(): Promise<Actor | null> {
	const token = requestToken();
	if (!token) return null;
	const response = await fetch(identityUrl("/internal/sessions/current"), {
		headers: { ...internalHeaders(), Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		clearSessionCookie();
		return null;
	}
	return response.json() as Promise<Actor>;
}

export async function requireActor(): Promise<Actor> {
	const actor = await currentActor();
	if (!actor) throw new Error("Nicht angemeldet");
	return actor;
}

export async function logout(): Promise<void> {
	const token = requestToken();
	if (token)
		await fetch(identityUrl("/internal/sessions/current"), {
			method: "DELETE",
			headers: { ...internalHeaders(), Authorization: `Bearer ${token}` },
		});
	clearSessionCookie();
}
