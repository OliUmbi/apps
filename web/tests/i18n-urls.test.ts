import assert from "node:assert/strict";
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
