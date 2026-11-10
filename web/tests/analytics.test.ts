import assert from "node:assert/strict";
import test from "node:test";
import { normalizedRoute, routeIds } from "../packages/analytics/src/server";

/*
 * The analytics boundary: the route allowlist and the unknown-route fallback.
 * The client sends a route id, never a URL; anything outside the site's own
 * route tree collapses into "other" so the counter cannot grow arbitrary keys.
 */

test("route ids are collected from the nested route tree", () => {
	const tree = {
		id: "__root__",
		children: {
			"/": { id: "/", children: {} },
			"/products": {
				id: "/products",
				children: { "/products/$productId": { id: "/products/$productId" } },
			},
		},
	};
	assert.deepEqual(routeIds(tree).sort(), [
		"/",
		"/products",
		"/products/$productId",
		"__root__",
	]);
});

test("a route outside the allowlist is counted as other", () => {
	const allowed = ["/", "/products", "/products/$productId"];
	assert.equal(
		normalizedRoute("/products/$productId", allowed),
		"/products/$productId",
	);
	assert.equal(normalizedRoute("/../../../etc/passwd", allowed), "other");
	assert.equal(normalizedRoute("", allowed), "other");
});
