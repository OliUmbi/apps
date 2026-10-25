import type { PublicImageSize } from "./sizes";

/** A browser-safe, same-origin URL served by each public site's asset proxy. */
export function publicImageUrl(id: string, size: PublicImageSize = "xl") {
	return `/api/assets/${encodeURIComponent(id)}?size=${size}`;
}
