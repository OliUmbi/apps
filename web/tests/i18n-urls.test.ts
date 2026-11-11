import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
	deLocalizeUrl,
	localizeUrl,
} from "../packages/i18n/src/paraglide/runtime.js";

/*
 * The public URL contract: route files and type-safe links stay English, the
 * address bar, sitemaps and canonical URLs are German. The router rewrites with
 * these two functions, so a missing pattern is a user-visible 404 or an English
 * URL on a German site.
 */

const origin = "https://example.test";

const paths: [canonical: string, german: string][] = [
	["/about", "/ueber-uns"],
	["/contact", "/kontakt"],
	["/crops", "/anbau"],
	["/products", "/produkte"],
	["/latest", "/aktuelles"],
	["/events", "/anlaesse"],
	["/stories", "/geschichten"],
	["/donations", "/spenden"],
	["/join", "/beitreten"],
	["/services", "/angebot"],
	["/showcases", "/referenzen"],
	["/inquiry", "/anfrage"],
	["/review", "/bewertung"],
	["/privacy", "/datenschutz"],
	["/legal", "/impressum"],
	["/terms", "/agb"],
];

test("every canonical page has a German public path", () => {
	for (const [canonical, german] of paths) {
		assert.equal(
			localizeUrl(origin + canonical, { locale: "de-CH" }).pathname,
			german,
			canonical,
		);
		assert.equal(deLocalizeUrl(origin + german).pathname, canonical, german);
	}
});

test("dynamic detail paths keep their identifier", () => {
	for (const [canonical, german] of [
		["/products/abc", "/produkte/abc"],
		["/latest/fruehling", "/aktuelles/fruehling"],
		["/stories/lager", "/geschichten/lager"],
		["/showcases/hochzeit", "/referenzen/hochzeit"],
	]) {
		assert.equal(
			localizeUrl(origin + canonical, { locale: "de-CH" }).pathname,
			german,
		);
		assert.equal(deLocalizeUrl(origin + german).pathname, canonical);
	}
});

test("system routes are never localized", () => {
	for (const path of [
		"/newsletter/confirm/token",
		"/newsletter/unsubscribe/token",
		"/api/analytics/view",
	]) {
		assert.equal(deLocalizeUrl(origin + path).pathname, path);
	}
});

/*
 * The path table above is the contract; this test makes the route tree obey it.
 * A new page route without a urlPattern would otherwise ship an English URL on
 * a German site while the hand-maintained list stayed green. System routes are
 * the only exemptions and must stay explicit.
 */
const sites = ["jublawoma", "unclet", "zelglihof"];
const unlocalized = [/^\/$/, /^\/api\//, /^\/sitemap\.xml$/, /^\/newsletter\//];

function routeFiles(site: string): string[] {
	const routes = join(
		import.meta.dirname,
		"..",
		"sites",
		site,
		"src",
		"routes",
	);
	return readdirSync(routes, { recursive: true })
		.map((entry) => String(entry).replaceAll("\\", "/"))
		.filter((entry) => entry.endsWith(".tsx") || entry.endsWith(".ts"));
}

// TanStack file naming: dots separate segments, `[.]` is a literal dot and a
// trailing `index` is the parent path.
function routePath(file: string): string | null {
	const name = file.replace(/\.(ts|tsx)$/, "");
	if (name === "__root" || name.endsWith("/__root")) return null;
	const segments = name
		.replaceAll("[.]", "\u0000")
		.split(".")
		.map((segment) => segment.replaceAll("\u0000", "."));
	if (segments.at(-1) === "index") segments.pop();
	return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

test("every file route has a German path or an explicit exemption", () => {
	for (const site of sites) {
		for (const file of routeFiles(site)) {
			const route = routePath(file);
			if (!route) continue;
			const german = localizeUrl(origin + route, { locale: "de-CH" }).pathname;
			const exempt = unlocalized.some((pattern) => pattern.test(route));
			assert.ok(
				german !== route || exempt,
				`${site}/${file} (${route}) has no German urlPattern - add one or exempt the route`,
			);
		}
	}
});
