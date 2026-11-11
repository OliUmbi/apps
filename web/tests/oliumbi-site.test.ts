import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/*
 * Oliumbi is a static placeholder, so these are filesystem checks: the public
 * files a crawler asks for exist, and the router keeps its branded not-found
 * and error boundaries instead of falling back to TanStack's defaults.
 */

const root = path.resolve(import.meta.dirname, "..", "sites", "oliumbi");

test("the placeholder ships robots and a sitemap", () => {
	const robots = fs.readFileSync(
		path.join(root, "public", "robots.txt"),
		"utf8",
	);
	assert.match(robots, /Sitemap: https:\/\/oliumbi\.ch\/sitemap\.xml/);
	const sitemap = fs.readFileSync(
		path.join(root, "public", "sitemap.xml"),
		"utf8",
	);
	assert.match(sitemap, /<loc>https:\/\/oliumbi\.ch\/<\/loc>/);
});

test("the router keeps the branded status boundaries", () => {
	const router = fs.readFileSync(path.join(root, "src", "router.tsx"), "utf8");
	const rootRoute = fs.readFileSync(
		path.join(root, "src", "routes", "__root.tsx"),
		"utf8",
	);
	assert.match(router, /defaultErrorComponent: PageError/);
	assert.match(rootRoute, /notFoundComponent: NotFound/);
});

test("the placeholder uses the shared anonymous counter", () => {
	const rootRoute = fs.readFileSync(
		path.join(root, "src", "routes", "__root.tsx"),
		"utf8",
	);
	const page = fs.readFileSync(
		path.join(root, "src", "routes", "index.tsx"),
		"utf8",
	);
	assert.match(rootRoute, /usePageView/);
	assert.match(page, /counted anonymously/i);
	assert.ok(
		fs.existsSync(path.join(root, "src", "routes", "api.analytics.view.ts")),
	);
});
