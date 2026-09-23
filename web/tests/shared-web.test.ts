import assert from "node:assert/strict";
import test from "node:test";
import { proxyPublicImage } from "../packages/assets/src/public-image.server";
import { emailSchema, safeLinkHref } from "../packages/contracts/src";
import { createHttpClient, ServiceError } from "../packages/http-client/src";
import { responsiveSrcSet } from "../packages/ui/src/responsive-image";

test("email validation normalizes whitespace before validating", () => {
	assert.equal(emailSchema.parse("  USER@EXAMPLE.COM  "), "user@example.com");
	assert.equal(emailSchema.safeParse("invalid").success, false);
});

test("link validation rejects control-character and backslash URL tricks", () => {
	for (const href of [
		"javascript:alert(1)",
		"//example.com",
		"/\\\\example.com",
		"java\nscript:alert(1)",
	]) {
		assert.equal(safeLinkHref(href), undefined);
	}
	assert.equal(safeLinkHref(" /contact "), "/contact");
	assert.equal(
		safeLinkHref("https://example.com/path"),
		"https://example.com/path",
	);
});

test("proxied images produce responsive rendition URLs", () => {
	const srcSet = responsiveSrcSet("/api/assets/abc?size=xl&site=zelglihof");
	assert.ok(srcSet?.includes("/api/assets/abc?size=xs&site=zelglihof 320w"));
	assert.ok(srcSet?.includes("size=2xl"));
	assert.equal(responsiveSrcSet("/images/banner.jpg"), undefined);
	assert.ok(
		responsiveSrcSet("//cdn.example.com/images/abc?size=xl")?.startsWith(
			"//cdn.example.com/images/abc?size=xs 320w",
		),
	);
	assert.equal(responsiveSrcSet("images/abc?size=xl"), undefined);
});

test("HTTP requests preserve caller cancellation alongside the timeout", async () => {
	const controller = new AbortController();
	let observedSignal: AbortSignal | null | undefined;
	const client = createHttpClient({
		name: "Test",
		baseUrl: () => "https://example.test",
		token: () => "test-token",
		fetch: async (_url, init) => {
			observedSignal = init?.signal;
			return new Response(null, { status: 204 });
		},
	});
	await client.empty("/test", { signal: controller.signal });
	controller.abort("cancelled");
	assert.equal(observedSignal?.aborted, true);
	assert.equal(observedSignal?.reason, "cancelled");
});

test("HTTP service failures retain a recognizable error type and status", async () => {
	const client = createHttpClient({
		name: "Test",
		baseUrl: () => "https://example.test",
		token: () => "test-token",
		fetch: async () => new Response(null, { status: 503 }),
	});
	await assert.rejects(
		client.empty("/test"),
		(error: unknown) =>
			error instanceof ServiceError &&
			error.status === 503 &&
			error.name === "ServiceError",
	);
});

test("image proxy validates identifiers before making a request", async (context) => {
	const fetch = context.mock.method(globalThis, "fetch", async () => {
		throw new Error("Unexpected fetch");
	});
	const response = await proxyPublicImage(
		new Request("https://example.test/api/assets/invalid"),
		"invalid",
	);
	assert.equal(response.status, 400);
	assert.equal(fetch.mock.callCount(), 0);
});

test("image proxy forwards cache validation and preserves 304 metadata", async (context) => {
	let headers: Headers | undefined;
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: unknown, init?: RequestInit) => {
			headers = new Headers(init?.headers);
			return new Response(null, {
				status: 304,
				headers: { ETag: '"version"', "Cache-Control": "public, max-age=3600" },
			});
		},
	);
	const response = await proxyPublicImage(
		new Request("https://example.test/api/assets/id", {
			headers: { "If-None-Match": '"version"' },
		}),
		"6c7e6880-5e35-48d7-9a5a-82dfd56e439b",
	);
	assert.equal(headers?.get("If-None-Match"), '"version"');
	assert.equal(response.status, 304);
	assert.equal(response.headers.get("ETag"), '"version"');
	assert.equal(response.headers.get("Cache-Control"), "public, max-age=3600");
});
