import assert from "node:assert/strict";
import test from "node:test";
import { ServiceError } from "../packages/http-client/src/error";
import {
	isInvalidSession,
	readSessionToken,
	sessionCookieHeader,
	sessionCookieName,
} from "../sites/studio/src/server/session";

/*
 * The Studio session boundary: the cookie contract and the one failure class
 * that means "the session is gone". These tests pin the security-relevant
 * parts - the __Host- prefix, the flags, the downgrade rejection and the
 * "do not sign users out during an outage" rule - not the HTTP plumbing.
 */

test("the secure cookie name carries the __Host- prefix", () => {
	assert.equal(sessionCookieName(true), "__Host-studio_session");
	assert.equal(sessionCookieName(false), "studio_session");
});

test("the session cookie sets the full attribute set", () => {
	const expires = new Date("2026-11-17T12:00:00.000Z");
	assert.equal(
		sessionCookieHeader(true, "token-value", expires),
		"__Host-studio_session=token-value; Path=/; HttpOnly; SameSite=Lax; Expires=Tue, 17 Nov 2026 12:00:00 GMT; Secure",
	);
});

test("development cookies omit Secure but keep the other flags", () => {
	const header = sessionCookieHeader(false, "token-value", new Date(0));
	assert.equal(
		header,
		"studio_session=token-value; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
	);
	assert.ok(!header.includes("Secure"));
});

test("cookie values are percent-encoded", () => {
	const header = sessionCookieHeader(false, "a+b/c=", new Date(0));
	assert.ok(header.startsWith("studio_session=a%2Bb%2Fc%3D;"));
});

test("the token is read from the matching cookie only", () => {
	assert.equal(readSessionToken(null, false), null);
	assert.equal(readSessionToken("other=1; studio_session=abc", false), "abc");
	assert.equal(
		readSessionToken("studio_session=abc; other=1", true),
		null,
		"a plain cookie must not satisfy the secure name",
	);
	assert.equal(readSessionToken("studio_session=", false), null);
	assert.equal(readSessionToken("studio_session", false), null);
});

test("a malformed percent sequence is not a session", () => {
	assert.equal(readSessionToken("studio_session=%E0%A4%A", false), null);
});

test("only 401 and 404 invalidate the session", () => {
	assert.equal(isInvalidSession(new ServiceError("identity", 401)), true);
	assert.equal(isInvalidSession(new ServiceError("identity", 404)), true);
	assert.equal(isInvalidSession(new ServiceError("identity", 503)), false);
	assert.equal(isInvalidSession(new ServiceError("identity", 500)), false);
	assert.equal(isInvalidSession(new ServiceError("identity", 409)), false);
	assert.equal(isInvalidSession(new Error("boom")), false);
	assert.equal(isInvalidSession(undefined), false);
});
