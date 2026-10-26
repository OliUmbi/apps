// Canonical origin (also in public/sitemap.xml); social preview images must be
// absolute URLs, so relative asset paths are joined onto it.
export const siteOrigin = "https://uncle-t.ch";

export function absoluteUrl(path: string): string {
	return new URL(path, siteOrigin).href;
}

/*
 * Per-route head entries. The root route keeps the site-wide defaults and the
 * deepest matching route wins per attribute, so a page overrides only the
 * entries it sets here. Titles carry their own site suffix.
 */
export function pageHead(options: {
	title: string;
	description?: string | null;
	image?: string | null;
}) {
	const meta: Record<string, string>[] = [
		{ title: options.title },
		{ property: "og:title", content: options.title },
	];
	if (options.description) {
		meta.push({ name: "description", content: options.description });
		meta.push({ property: "og:description", content: options.description });
	}
	if (options.image)
		meta.push({ property: "og:image", content: absoluteUrl(options.image) });
	return { meta };
}
