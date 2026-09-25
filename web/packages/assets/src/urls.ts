export const publicImageSizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
export type PublicImageSize = (typeof publicImageSizes)[number];
export const imageVariantSizes = [...publicImageSizes, "master"] as const;
export type ImageVariantSize = (typeof imageVariantSizes)[number];

export function imageUrl(
	baseUrl: string,
	id: string,
	size: PublicImageSize = "xl",
) {
	return new URL(`/images/${encodeURIComponent(id)}?size=${size}`, baseUrl)
		.href;
}

/** A browser-safe, same-origin URL served by each public site's asset proxy. */
export function publicImageUrl(id: string, size: PublicImageSize = "xl") {
	return `/api/assets/${encodeURIComponent(id)}?size=${size}`;
}
export function documentUrl(baseUrl: string, slug: string) {
	return new URL(`/documents/${encodeURIComponent(slug)}`, baseUrl).href;
}
