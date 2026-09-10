export const imageSizes = [
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"original",
] as const;
export type ImageSize = (typeof imageSizes)[number];
export function imageUrl(baseUrl: string, id: string, size: ImageSize = "xl") {
	return new URL(`/images/${encodeURIComponent(id)}?size=${size}`, baseUrl)
		.href;
}
export function documentUrl(baseUrl: string, slug: string) {
	return new URL(`/documents/${encodeURIComponent(slug)}`, baseUrl).href;
}
