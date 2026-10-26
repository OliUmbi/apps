// Canonical origin (also in public/sitemap.xml); social preview images must be
// absolute URLs, so relative asset paths are joined onto it.
export const siteOrigin = "https://zelglihof-maegenwil.ch";

export function absoluteUrl(path: string): string {
	return new URL(path, siteOrigin).href;
}
