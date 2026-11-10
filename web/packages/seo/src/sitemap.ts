/*
 * Sitemap serialisation. The caller owns the URL set (static routes plus
 * published content), so this stays a pure function and is pinned by a test.
 */

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export function sitemapXml(urls: readonly string[]): string {
	const entries = urls
		.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
		.join("\n");
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		entries,
		"</urlset>",
		"",
	].join("\n");
}
