import assert from "node:assert/strict";
import test from "node:test";
import {
	absoluteUrl,
	localBusinessJsonLd,
	organizationJsonLd,
} from "../packages/seo/src/index";
import { sitemapXml } from "../packages/seo/src/sitemap";

/*
 * The SEO surfaces are pure builders: a sitemap must stay well-formed when a
 * slug contains an ampersand, and the structured data must carry the address
 * in the shape search engines expect.
 */

test("a sitemap is well-formed and escapes the URL", () => {
	const xml = sitemapXml([
		"https://example.test/",
		"https://example.test/aktuelles/a&b<c>",
	]);
	assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
	assert.ok(xml.includes("<loc>https://example.test/</loc>"));
	assert.ok(
		xml.includes("<loc>https://example.test/aktuelles/a&amp;b&lt;c&gt;</loc>"),
	);
	assert.ok(xml.includes("</urlset>"));
});

test("absolute URLs join against the site origin", () => {
	assert.equal(
		absoluteUrl("https://example.test", "/produkte/abc"),
		"https://example.test/produkte/abc",
	);
});

test("local business data carries the postal address", () => {
	const data = localBusinessJsonLd({
		name: "Uncle-T GmbH",
		url: "https://uncle-t.ch",
		street: "Zelgliweg 2",
		postalCode: "5506",
		city: "Mägenwil",
		email: "info@uncle-t.ch",
	});
	assert.equal(data["@type"], "LocalBusiness");
	assert.deepEqual(data.address, {
		"@type": "PostalAddress",
		streetAddress: "Zelgliweg 2",
		postalCode: "5506",
		addressLocality: "Mägenwil",
		addressCountry: "CH",
	});
	assert.equal(data.email, "info@uncle-t.ch");
});

test("an organization stays minimal without an address", () => {
	const data = organizationJsonLd({
		name: "Jubla Woma",
		url: "https://jublawoma.ch",
	});
	assert.deepEqual(data, {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Jubla Woma",
		url: "https://jublawoma.ch",
	});
});
